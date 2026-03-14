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
CONTROL_STATE_URL = f"{BASE_URL}/api/hmi/control-state"

PAGE_FUEL_CELL = "fuel_cell"
PAGE_METHANOL_REFORMER = "methanol_reformer"
POWER_MODE_GENSET_OFF = "GENSET_OFF"
POWER_MODE_GENERATION_ON = "POWER_GENERATION_ON"
POWER_MODE_GENERATION_OFF = "POWER_GENERATION_OFF"
MR_MODE_RUN = "MR_RUN"
MR_MODE_HEAT_STANDBY = "MR_HEAT_STANDBY"

CONTROL_SEQUENCE = [
    "Start Processing",
    "Idle",
    "Service Mode",
    "PS Available",
]

POWER_OFF_SEQUENCE = [
    "Stop Processing",
    "Stopped",
    "Sleep",
]

AVAILABLE_COMMANDS = {
    "Stopped": ["power_on"],
    "Sleep": ["power_on"],
    "Service Mode": ["genset_off", "h2_bypass", "power_off"],
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


def fetch_control_state():
    with urllib.request.urlopen(CONTROL_STATE_URL, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))
        return payload.get("controlState", {})


def make_density_sample():
    if random.random() < 0.2:
        return 2

    return random.randint(135, 170)


def make_h2_pressure_sample(power_mode, h2_bypass_requested):
    return random.randint(22, 27)


def resolve_available_commands(is_powered_on, control_state):
    if not is_powered_on:
        return ["power_on"]

    return AVAILABLE_COMMANDS.get(control_state, ["power_off"])


def generate_methanol_parameters(h2_pressure_psi):
    return [
        {"id": "h2_pressure", "label": "H2 Pressure", "value": f"{h2_pressure_psi} PSI"},
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


def build_payload(control_snapshot, control_state, is_powered_on):
    power_mode = control_snapshot.get("powerMode", POWER_MODE_GENERATION_ON)
    mr_mode = control_snapshot.get("mrMode", MR_MODE_RUN)
    threshold_psi = control_snapshot.get("pressureThresholdPsi", 27)
    can_request = control_snapshot.get("canRequest", {})
    valves = control_snapshot.get("valves", {})
    h2_bypass_requested = control_snapshot.get("h2BypassRequested", False)
    pressure_psi = make_h2_pressure_sample(power_mode, h2_bypass_requested)
    pressure_bypass_active = pressure_psi >= threshold_psi

    if power_mode == POWER_MODE_GENSET_OFF:
        return {
            "source": "python-simulator",
            "powerState": "off",
            "powerMode": power_mode,
            "controlState": control_state,
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
            "h2PressurePsi": pressure_psi,
            "h2BypassThresholdPsi": threshold_psi,
            "pressureBypassActive": pressure_bypass_active,
            "h2BypassRequested": h2_bypass_requested,
            "controlSystem": {
                "powerMode": power_mode,
                "mrMode": mr_mode,
                "h2BypassRequested": h2_bypass_requested,
                "pressureBypassActive": pressure_bypass_active,
                "pressurePsi": pressure_psi,
                "pressureThresholdPsi": threshold_psi,
                "valves": valves,
                "canRequest": can_request,
            },
            "methanolReformer": {
                "controlState": control_state,
                "mrMode": mr_mode,
            },
        }

    output_request = random.choice([650, 700, 750, 800])
    warnings = random.randint(0, 5)
    shutdowns = random.randint(0, 1)
    effective_output_value = (
        0 if power_mode == POWER_MODE_GENERATION_OFF else can_request.get("outputValueW", 100)
    )
    effective_output_upper_limit = can_request.get("outputUpperLimitW", 200)

    return {
        "source": "python-simulator",
        "page": PAGE_FUEL_CELL,
        "powerState": "off" if power_mode == POWER_MODE_GENERATION_OFF else "on",
        "powerMode": power_mode,
        "externalDetectorDensityPpm": make_density_sample(),
        "outputValueW": effective_output_value,
        "outputUpperLimitW": effective_output_upper_limit,
        "activeAlerts": {
            "shutdowns": shutdowns,
            "warnings": warnings,
        },
        "controlState": control_state,
        "availableCommands": resolve_available_commands(power_mode == POWER_MODE_GENERATION_ON, control_state),
        "systemEcu": {
            "outputRequest": {"value": str(output_request), "unit": "W"},
            "startStop": {"value": "ON" if power_mode == POWER_MODE_GENERATION_ON else "OFF"},
        },
        "h2PressurePsi": pressure_psi,
        "h2BypassThresholdPsi": threshold_psi,
        "pressureBypassActive": pressure_bypass_active,
        "h2BypassRequested": h2_bypass_requested,
        "controlSystem": {
            "powerMode": power_mode,
            "mrMode": mr_mode,
            "h2BypassRequested": h2_bypass_requested,
            "pressureBypassActive": pressure_bypass_active,
            "pressurePsi": pressure_psi,
            "pressureThresholdPsi": threshold_psi,
            "valves": valves,
            "canRequest": can_request,
        },
        "methanolReformer": {
            "controlState": control_state,
            "mrMode": mr_mode,
        },
    }


def build_methanol_payload(control_snapshot, control_state, is_powered_on, batch):
    power_mode = control_snapshot.get("powerMode", POWER_MODE_GENERATION_ON)
    mr_mode = control_snapshot.get("mrMode", MR_MODE_RUN)
    threshold_psi = control_snapshot.get("pressureThresholdPsi", 27)
    h2_bypass_requested = control_snapshot.get("h2BypassRequested", False)
    pressure_psi = make_h2_pressure_sample(power_mode, h2_bypass_requested)
    pressure_bypass_active = pressure_psi >= threshold_psi
    return {
        "source": "python-simulator",
        "page": PAGE_METHANOL_REFORMER,
        "powerState": "on" if is_powered_on else "off",
        "powerMode": power_mode,
        "h2PressurePsi": pressure_psi,
        "h2BypassThresholdPsi": threshold_psi,
        "pressureBypassActive": pressure_bypass_active,
        "h2BypassRequested": h2_bypass_requested,
        "controlSystem": {
            **control_snapshot,
            "pressurePsi": pressure_psi,
            "pressureThresholdPsi": threshold_psi,
            "pressureBypassActive": pressure_bypass_active,
            "h2BypassRequested": h2_bypass_requested,
        },
        "methanolReformer": {
            "controlState": control_state,
            "mrMode": mr_mode,
            "systemParameters": batch,
        },
    }


def next_control_state(current_state):
    current_index = CONTROL_SEQUENCE.index(current_state)
    return CONTROL_SEQUENCE[min(current_index + 1, len(CONTROL_SEQUENCE) - 1)]


def next_power_off_state(current_state):
    current_index = POWER_OFF_SEQUENCE.index(current_state)
    return POWER_OFF_SEQUENCE[min(current_index + 1, len(POWER_OFF_SEQUENCE) - 1)]


def apply_command(current_state, is_powered_on, command):
    action_id = command.get("actionId")

    if action_id == "power_on":
        return "Start Processing", True

    if action_id == "power_off":
        return "Stop Processing", False

    if action_id == "genset_off":
        return "Service Mode", is_powered_on

    if action_id == "h2_bypass":
        return "PS Available", is_powered_on

    return current_state, is_powered_on


def main():
    current_state = "Start Processing"
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
            control_snapshot = fetch_control_state()
            active_page = context.get("activePage", PAGE_FUEL_CELL)
            commands = fetch_commands(last_command_id)
            power_mode = control_snapshot.get("powerMode", POWER_MODE_GENERATION_ON)
            h2_bypass_requested = control_snapshot.get("h2BypassRequested", False)
            pressure_threshold_reached = control_snapshot.get("pressureThresholdReached", False)
            is_powered_on = power_mode == POWER_MODE_GENERATION_ON

            for command in commands:
                last_command_id = max(last_command_id, command["id"])
                current_state, is_powered_on = apply_command(current_state, is_powered_on, command)
                print(f"[ui-command] received {command['actionId']} at {command['requestedAt']}")

            if power_mode == POWER_MODE_GENSET_OFF:
                current_state = "Stopped"
            elif power_mode == POWER_MODE_GENERATION_OFF:
                if current_state not in POWER_OFF_SEQUENCE:
                    current_state = "Stop Processing"
            elif active_page == PAGE_FUEL_CELL and is_powered_on and tick and tick % 4 == 0:
                current_state = next_control_state(current_state)

            if power_mode == POWER_MODE_GENERATION_OFF and current_state in POWER_OFF_SEQUENCE and tick and tick % 4 == 0:
                current_state = next_power_off_state(current_state)

            if active_page == PAGE_METHANOL_REFORMER:
                if not methanol_snapshot or methanol_cursor >= len(methanol_snapshot):
                    methanol_snapshot = generate_methanol_parameters(
                        control_snapshot.get("pressurePsi", 0),
                    )
                    methanol_cursor = 0

                batch_size = 8 if methanol_cursor == 0 else len(methanol_snapshot) - methanol_cursor
                batch = methanol_snapshot[methanol_cursor:methanol_cursor + batch_size]
                methanol_cursor += batch_size
                payload = build_methanol_payload(control_snapshot, current_state, is_powered_on, batch)
            else:
                payload = build_payload(control_snapshot, current_state, is_powered_on)

            response = post_json(UPDATE_URL, payload)
            if active_page == PAGE_METHANOL_REFORMER:
                current_parameters = response["state"]["methanolReformer"]["systemParameters"]
                print(
                    f"[python-update] page=methanol_reformer power={'on' if is_powered_on else 'off'} "
                    f"batch={len(batch)} total={len(current_parameters)} valves={control_snapshot.get('valves', {})}"
                )
            else:
                density_value = response["state"]["fuelCell"]["metrics"][2]["displayValue"]
                print(
                    f"[python-update] page=fuel_cell power={'on' if is_powered_on else 'off'} "
                    f"state={response['state']['fuelCell']['controlState']['active']} density={density_value} "
                    f"bypass={'on' if h2_bypass_requested or pressure_threshold_reached else 'off'} "
                    f"pressure={control_snapshot.get('pressurePsi', 0)}psi valves={control_snapshot.get('valves', {})}"
                )
        except urllib.error.URLError as error:
            print(f"[simulator-error] {error}")

        tick += 1
        time.sleep(2)


if __name__ == "__main__":
    main()
