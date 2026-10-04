// Heart Attack Redux v1.1
// Original concept: Junior_Djjr (Heart Attack Mod v1.0, 2020)
// Custom CLEO Redux remaster by Flaqko
// Target: GTA San Andreas Classic 1.0 + CLEO Redux
//
// Flaqko design:
// - Fat alone never causes a heart attack.
// - CJ must be overweight AND actively sprinting on foot.
// - Sprint strain accumulates across normal short stamina rests.
// - Longer rests gradually recover accumulated strain.
// - Immersive attack: tired/out-of-breath -> collapse -> death.
// - Low-frequency gameplay loop; no per-frame polling.

const MOD_NAME = "Heart Attack Redux v1.1";

const FAT_STAT = 21;
const DANGER_FAT = 600.0;
const MAX_FAT = 1000.0;

// GTA SA game-control button 16 = accelerate in vehicles / sprint on foot.
const SPRINT_BUTTON = 16;
const PAD_ID = 0;

// Low-frequency gameplay polling.
const CHECK_INTERVAL_MS = 250;

// Release balance tuned for real mission consequences.
// At maximum fat, CJ receives a randomized target between 20 and 40 seconds
// of accumulated sprint strain. Every 100 fat below that adds about 5 seconds
// to both ends of the range:
// 1000 FAT: 20-40 sec
//  900 FAT: 25-45 sec
//  800 FAT: 30-50 sec
//  700 FAT: 35-55 sec
//  600 FAT: 40-60 sec
const MAX_FAT_TARGET_MIN_SEC = 20.0;
const MAX_FAT_TARGET_MAX_SEC = 40.0;

// Short rests are treated as ordinary stamina recovery and preserve strain.
// After 10 seconds without sprinting, strain starts recovering at 25% speed:
// every 4 real seconds of rest removes about 1 second of sprint strain.
const REST_GRACE_MS = 10000;
const RECOVERY_RATE = 0.25;

const player = new Player(0);

let sprintExposureMs = 0;
let attackTargetMs = 0;
let restTimeMs = 0;
let wasSprinting = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
    return min + (Math.random() * (max - min));
}

function resetExposure() {
    sprintExposureMs = 0;
    attackTargetMs = 0;
    restTimeMs = 0;
    wasSprinting = false;
}

function chooseAttackTarget(fat) {
    // Every 100 fat below 1000 adds about 5 seconds to both ends of the
    // randomized range, giving real pressure during chase missions while still
    // making lower-fat CJ slightly safer.
    const clampedFat = clamp(fat, DANGER_FAT, MAX_FAT);
    const fatStepsBelowMax = (MAX_FAT - clampedFat) / 100.0;

    const minSec = MAX_FAT_TARGET_MIN_SEC + (fatStepsBelowMax * 5.0);
    const maxSec = MAX_FAT_TARGET_MAX_SEC + (fatStepsBelowMax * 5.0);
    const targetSec = randomRange(minSec, maxSec);

    attackTargetMs = Math.max(CHECK_INTERVAL_MS, Math.round(targetSec * 1000.0));
}

function isActuallySprinting(cj) {
    if (cj.isInAnyCar()) return false;
    if (cj.isInWater()) return false;
    if (cj.isInAir()) return false;
    if (cj.isStopped()) return false;

    return Pad.IsButtonPressed(PAD_ID, SPRINT_BUTTON);
}

function triggerHeartAttack() {
    const cj = player.getChar();

    // Phase 1: GTA's native tired/out-of-breath task.
    Task.Tired(cj, 1300);
    wait(1050);

    if (!player.isPlaying()) return;

    // Phase 2: stock PED torso-clutch/collapse animation.
    Task.PlayAnimNonInterruptable(
        cj,
        "KO_shot_stom",
        "PED",
        4.0,
        false,
        false,
        false,
        true,
        1500
    );
    wait(950);

    if (!player.isPlaying()) return;

    // Phase 3: proven character-health death path.
    cj.setHealth(0);
}

log("[HeartAttackRedux] " + MOD_NAME + " loaded - mission-tuned fat+sprint strain, long-rest recovery, immersive collapse.");

while (true) {
    wait(CHECK_INTERVAL_MS);

    if (!player.isPlaying()) {
        resetExposure();
        continue;
    }

    const fat = Stat.GetFloat(FAT_STAT);

    // Below the danger threshold there is no retained cardiac strain.
    if (fat <= DANGER_FAT) {
        resetExposure();
        continue;
    }

    const cj = player.getChar();
    const sprinting = isActuallySprinting(cj);

    if (!sprinting) {
        if (wasSprinting) {
            restTimeMs = 0;
        }

        wasSprinting = false;
        restTimeMs += CHECK_INTERVAL_MS;

        // Allow normal short stamina breaks without erasing danger. Only a
        // genuinely longer rest starts reducing accumulated sprint strain.
        if (restTimeMs > REST_GRACE_MS && sprintExposureMs > 0) {
            sprintExposureMs = Math.max(
                0,
                sprintExposureMs - (CHECK_INTERVAL_MS * RECOVERY_RATE)
            );

            // A full recovery begins a fresh randomized danger cycle.
            if (sprintExposureMs <= 0) {
                sprintExposureMs = 0;
                attackTargetMs = 0;
            }
        }

        continue;
    }

    wasSprinting = true;
    restTimeMs = 0;

    if (attackTargetMs <= 0) {
        chooseAttackTarget(fat);
    }

    sprintExposureMs += CHECK_INTERVAL_MS;

    if (sprintExposureMs >= attackTargetMs) {
        triggerHeartAttack();
        resetExposure();

        // Prevent an immediate retrigger during WASTED/hospital flow.
        wait(60000);
    }
}
