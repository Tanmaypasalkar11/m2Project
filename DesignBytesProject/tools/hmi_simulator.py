import json
import random
import time
import urllib.error
import urllib.parse
import urllib.request

BASE_URL = "http://localhost:4000"
UPDATE_URL = f"{BASE_URL}/api/hmi/python-update"
COMMAND_URL = f"{BASE_URL}/api/hmi/commands"
CONTEXT_URL = f"{BASE_URL}/api/hmi/context"

PAGE_FUEL_CELL = "fuel_cell"
PAGE_METHANOL_REFORMER = "methanol_reformer"

CONTROL_SEQUENCE = [
    "Stopped",
    "Sleep",
    "PS Available",
    "Start Processing",
    "Idle",
    "Stop Processing",
]

AVAILABLE_COMMANDS = {
    "Stopped": ["power_off"],
    "Sleep": ["power_off"],
    "PS Available": ["power_off"],
    "Start Processing": ["power_off"],
    "Idle": ["power_off", "h2_bypass"],
    "Stop Processing": ["power_off"],
}

METHANOL_PARAMETER_BLUEPRINT = [
    {"id": "h2_pressure", "label": "H2 Pressure"},
    {"id": "h2_flow", "label": "H2 Flow"},
    {"id": "reformer_in", "label": "Reformer In"},
    {"id": "reformer_out", "label": "Reformer Out"},
    {"id": "membrane_in", "label": "Membrane In"},
    {"id": "membrane_out", "label": "Membrane Out"},
    {"id": "major_fault_code", "label": "Major Fault Code"},
    {"id": "thermal_cycle_temp", "label": "Thermal Cycle Temp"},
    {"id": "stack_voltage", "label": "Stack Voltage"},
    {"id": "major_fault_status", "label": "Major Fault Status"},
]


def post_json(url, payload):
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_commands(after_id):
    url = f"{COMMAND_URL}?afterId={after_id}"

    with urllib.request.urlopen(url, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
        return payload.get("commands", [])


def fetch_context():
    with urllib.request.urlopen(CONTEXT_URL, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
        return payload.get("context", {"activePage": PAGE_FUEL_CELL, "systemPower": "on"})


def make_density_sample():
    if random.random() < 0.2:
        return 2

    return random.randint(135, 170)


def resolve_available_commands(is_powered_on, control_state):
    if not is_powered_on:
        return ["power_on"]

    return AVAILABLE_COMMANDS.get(control_state, ["power_off"])


def generate_methanol_parameters():
    return [
        {"id": "h2_pressure", "label": "H2 Pressure", "value": f"{random.randint(8, 18)} bar"},
        {"id": "h2_flow", "label": "H2 Flow", "value": f"{random.randint(12, 24)} LPM"},
        {"id": "reformer_in", "label": "Reformer In", "value": f"{random.randint(140, 180)} C"},
        {"id": "reformer_out", "label": "Reformer Out", "value": f"{random.randint(190, 240)} C"},
        {"id": "membrane_in", "label": "Membrane In", "value": f"{random.randint(100, 135)} C"},
        {"id": "membrane_out", "label": "Membrane Out", "value": f"{random.randint(90, 120)} C"},
        {"id": "major_fault_code", "label": "Major Fault Code", "value": random.choice(["None", "213", "118"])},
        {"id": "thermal_cycle_temp", "label": "Thermal Cycle Temp", "value": f"{random.randint(25, 45)} C"},
        {"id": "stack_voltage", "label": "Stack Voltage", "value": f"{random.randint(24, 32)} V"},
        {"id": "major_fault_status", "label": "Major Fault Status", "value": random.choice(["Normal", "Watch", "None"])},
    ]


def build_payload(control_state, is_powered_on):
    if not is_powered_on:
        return {
            "source": "python-simulator",
            "powerState": "off",
            "controlState": "Stopped",
            "availableCommands": ["power_on"],
            "externalDetectorDensityPpm": 0,
            "activeAlerts": {
                "shutdowns": 0,
                "warnings": 0,
            },
            "outputValueW": 0,
            "systemEcu": {
                "outputRequest": {"value": "0", "unit": "W"},
                "startStop": {"value": "OFF"},
            },
            "methanolReformer": {
                "controlState": "Stopped",
            },
        }

    output_request = random.choice([650, 700, 750, 800])
    warnings = random.randint(0, 5)
    shutdowns = random.randint(0, 1)

    return {
        "source": "python-simulator",
        "page": PAGE_FUEL_CELL,
        "powerState": "on",
        "externalDetectorDensityPpm": make_density_sample(),
        "activeAlerts": {
            "shutdowns": shutdowns,
            "warnings": warnings,
        },
        "controlState": control_state,
        "availableCommands": resolve_available_commands(is_powered_on, control_state),
        "systemEcu": {
            "outputRequest": {"value": str(output_request), "unit": "W"},
            "startStop": {"value": "ON" if control_state not in {"Stopped", "Sleep"} else "OFF"},
        },
        "methanolReformer": {
            "controlState": control_state,
        },
    }


def build_methanol_payload(control_state, is_powered_on, batch):
    return {
        "source": "python-simulator",
        "page": PAGE_METHANOL_REFORMER,
        "powerState": "on" if is_powered_on else "off",
        "methanolReformer": {
            "controlState": control_state,
            "systemParameters": batch,
        },
    }


def next_control_state(current_state):
    current_index = CONTROL_SEQUENCE.index(current_state)
    return CONTROL_SEQUENCE[(current_index + 1) % len(CONTROL_SEQUENCE)]


def apply_command(current_state, is_powered_on, command):
    action_id = command.get("actionId")

    if action_id == "power_on":
        return "Start Processing", True

    if action_id == "power_off":
        return "Stopped", False

    if action_id == "genset_off":
        return "Service Mode", is_powered_on

    if action_id == "h2_bypass":
        return "PS Available", is_powered_on

    return current_state, is_powered_on


def main():
    current_state = "Stopped"
    is_powered_on = True
    last_command_id = 0
    tick = 0
    active_page = PAGE_FUEL_CELL
    methanol_snapshot = []
    methanol_cursor = 0

    print("Python HMI simulator started")

    while True:
        try:
            context = fetch_context()
            active_page = context.get("activePage", PAGE_FUEL_CELL)
            commands = fetch_commands(last_command_id)

            for command in commands:
                last_command_id = max(last_command_id, command["id"])
                current_state, is_powered_on = apply_command(current_state, is_powered_on, command)
                print(f"[ui-command] received {command['actionId']} at {command['requestedAt']}")

            if active_page == PAGE_FUEL_CELL and is_powered_on and tick and tick % 4 == 0:
                current_state = next_control_state(current_state)

            if active_page == PAGE_METHANOL_REFORMER:
                if not methanol_snapshot or methanol_cursor >= len(methanol_snapshot):
                    methanol_snapshot = generate_methanol_parameters()
                    methanol_cursor = 0

                batch_size = 8 if methanol_cursor == 0 else len(methanol_snapshot) - methanol_cursor
                batch = methanol_snapshot[methanol_cursor:methanol_cursor + batch_size]
                methanol_cursor += batch_size
                payload = build_methanol_payload(current_state, is_powered_on, batch)
            else:
                payload = build_payload(current_state, is_powered_on)

            response = post_json(UPDATE_URL, payload)
            if active_page == PAGE_METHANOL_REFORMER:
                current_parameters = response["state"]["methanolReformer"]["systemParameters"]
                print(
                    f"[python-update] page=methanol_reformer power={'on' if is_powered_on else 'off'} "
                    f"batch={len(batch)} total={len(current_parameters)}"
                )
            else:
                density_value = response["state"]["fuelCell"]["metrics"][2]["displayValue"]
                print(
                    f"[python-update] page=fuel_cell power={'on' if is_powered_on else 'off'} "
                    f"state={response['state']['fuelCell']['controlState']['active']} density={density_value}"
                )
        except urllib.error.URLError as error:
            print(f"[simulator-error] {error}")

        tick += 1
        time.sleep(2)


if __name__ == "__main__":
    main()
