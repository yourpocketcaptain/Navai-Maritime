"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Radio, ShieldAlert, AlertTriangle, Info, MessageSquare,
    ChevronRight, ChevronLeft, Send, Volume2, Globe,
    Anchor, Hash, Key, Plane, HelpCircle, X, Clock, Navigation, Ship,
    Check, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

type Language = 'en' | 'es';
type Protocol = 'distress' | 'urgency' | 'safety' | 'routine';

interface RadioState {
    step: number;
    language: Language;
    vessel: {
        name: string;
        mmsi: string;
        callSign: string;
    };
    targetVessel: string;
    protocol: Protocol | null;
    message: {
        position: string;
        problem: string;
        peopleOnBoard: string;
        assistance: string;
        routineScenario: string;
        routinePhase: number;
    };
    showResponse: boolean;
}

// --- Constants ---

const PROTOCOLS: { id: Protocol; labels: Record<Language, string>; sub: string; color: string; icon: any; proword: string }[] = [
    { id: 'distress', labels: { en: 'Distress', es: 'Socorro' }, sub: 'MAYDAY', color: '#ef4444', icon: ShieldAlert, proword: 'MAYDAY' },
    { id: 'urgency', labels: { en: 'Urgency', es: 'Urgencia' }, sub: 'PAN-PAN', color: '#eab308', icon: AlertTriangle, proword: 'PAN-PAN' },
    { id: 'safety', labels: { en: 'Safety', es: 'Seguridad' }, sub: 'SECURITÉ', color: '#22c55e', icon: Info, proword: 'SECURITÉ' },
    { id: 'routine', labels: { en: 'Routine', es: 'Rutina' }, sub: 'ROUTINE', color: '#94a3b8', icon: MessageSquare, proword: 'ROUTINE' },
];

const NATO_ALPHABET = [
    { l: 'A', c: 'Alpha', p: 'Ál-fa' }, { l: 'N', c: 'November', p: 'No-vém-ber' },
    { l: 'B', c: 'Bravo', p: 'Brá-vo' }, { l: 'O', c: 'Oscar', p: 'Ós-car' },
    { l: 'C', c: 'Charlie', p: 'Chár-li' }, { l: 'P', c: 'Papa', p: 'Pa-pá' },
    { l: 'D', c: 'Delta', p: 'Dél-ta' }, { l: 'Q', c: 'Quebec', p: 'Ke-bék' },
    { l: 'E', c: 'Echo', p: 'É-ko' }, { l: 'R', c: 'Romeo', p: 'Ró-mi-o' },
    { l: 'F', c: 'Foxtrot', p: 'Fóks-trot' }, { l: 'S', c: 'Sierra', p: 'Si-ér-ra' },
    { l: 'G', c: 'Golf', p: 'Golf' }, { l: 'T', c: 'Tango', p: 'Tán-go' },
    { l: 'H', c: 'Hotel', p: 'Ho-tél' }, { l: 'U', c: 'Uniform', p: 'Yú-ni-form' },
    { l: 'I', c: 'India', p: 'Ín-di-a' }, { l: 'V', c: 'Victor', p: 'Vík-tor' },
    { l: 'J', c: 'Juliet', p: 'Yú-li-et' }, { l: 'W', c: 'Whiskey', p: 'Uís-ki' },
    { l: 'K', c: 'Kilo', p: 'Kí-lo' }, { l: 'X', c: 'X-ray', p: 'Éks-rei' },
    { l: 'L', c: 'Lima', p: 'Lí-ma' }, { l: 'Y', c: 'Yankee', p: 'Yán-ki' },
    { l: 'M', c: 'Mike', p: 'Maik' }, { l: 'Z', c: 'Zulu', p: 'Zú-lu' },
];

const ROUTINE_CATEGORIES: {
    id: string;
    label: Record<Language, string>;
    scenarios: {
        id: string;
        label: Record<Language, string>;
        assistance: Record<Language, string>;
        target: Record<Language, string>;
        response: Record<Language, string>;
        workingChannel?: string;
    }[];
}[] = [
        {
            id: 'marinas',
            label: { en: 'Ports & Marinas', es: 'Puertos y Marinas' },
            scenarios: [
                {
                    id: 'docking',
                    label: { en: 'Docking Request', es: 'Petición de Amarre' },
                    assistance: { en: 'Requesting docking for a 12-meter vessel for two nights', es: 'Solicito atraque para un velero de 12 metros para dos noches' },
                    target: { en: 'Port Control', es: 'Control de Puerto' },
                    response: { en: 'Roger, proceed to waiting dock. Switching to channel 09.', es: 'Recibido, proceda al muelle de espera. Cambie al canal 09.' },
                    workingChannel: '09'
                },
                {
                    id: 'fuel',
                    label: { en: 'Fuel Station', es: 'Solicitud de Gasolinera' },
                    assistance: { en: 'Requesting turn to refuel before departure', es: 'Solicito turno para repostar combustible antes de salir' },
                    target: { en: 'Marina Service', es: 'Servicio de Marina' },
                    response: { en: 'Roger, stand by at the fuel dock.', es: 'Recibido, espere en el muelle de combustible.' },
                    workingChannel: '09'
                },
                {
                    id: 'departure',
                    label: { en: 'Departure Notice', es: 'Aviso de Salida' },
                    assistance: { en: 'Informing of departure, berth is free', es: 'Informo de mi salida del puerto, dejo el amarre libre' },
                    target: { en: 'Port Control', es: 'Control de Puerto' },
                    response: { en: 'Roger, have a safe trip.', es: 'Recibido, buen viaje.' },
                    workingChannel: '09'
                },
                {
                    id: 'marineria',
                    label: { en: 'Mariners Services', es: 'Servicios de Marinería' },
                    assistance: { en: 'Requesting assistance for docking maneuver due to high wind', es: 'Solicito ayuda para maniobra de atraque con mucho viento' },
                    target: { en: 'Marina Service', es: 'Servicio de Marina' },
                    response: { en: 'Roger, a mariner is on his way.', es: 'Recibido, un marinero va en camino.' },
                    workingChannel: '09'
                }
            ]
        },
        {
            id: 'intership',
            label: { en: 'Between Ships', es: 'Comunicaciones Inter-buques' },
            scenarios: [
                {
                    id: 'crossing',
                    label: { en: 'Crossing Coordination', es: 'Coordinación de Paso' },
                    assistance: { en: 'Requesting a switch to channel 06 to agree on crossing maneuver', es: 'Solicito cambiar al canal 06 para acordar maniobra de cruce' },
                    target: { en: 'Vessel at my bow', es: 'Buque a mi proa' },
                    response: { en: 'Roger, switching to channel 06.', es: 'Recibido, cambio al canal 06.' },
                    workingChannel: '06'
                },
                {
                    id: 'social',
                    label: { en: 'Social/Info', es: 'Social/Información' },
                    assistance: { en: 'Asking about sea conditions or occupancy', es: 'Pregunto por el estado del oleaje o la ocupación' },
                    target: { en: 'Nearby Vessel', es: 'Barco cercano' },
                    response: { en: 'Conditions are calm, plenty of space.', es: 'Condiciones tranquilas, hay mucho espacio.' },
                    workingChannel: '72'
                },
                {
                    id: 'technical',
                    label: { en: 'Technical Help', es: 'Ayuda técnica' },
                    assistance: { en: 'Requesting position to confirm radar', es: 'Solicito su posición para confirmar mi radar' },
                    target: { en: 'Nearby Vessel', es: 'Barco cercano' },
                    response: { en: 'My position is 40º 42’ N...', es: 'Mi posición es 40º 42’ N...' },
                    workingChannel: '72'
                }
            ]
        },
        {
            id: 'traffic',
            label: { en: 'Traffic & Navigation', es: 'Servicios de Tráfico' },
            scenarios: [
                {
                    id: 'vts',
                    label: { en: 'VTS Reporting', es: 'Informe VTS' },
                    assistance: { en: 'Reporting entry into control zone', es: 'Informo de mi entrada en la zona de control' },
                    target: { en: 'Tarifa Traffic', es: 'Tarifa Tráfico' },
                    response: { en: 'Roger, proceed as planned.', es: 'Recibido, proceda según lo previsto.' }
                },
                {
                    id: 'bridge',
                    label: { en: 'Bridge/Lock', es: 'Puente/Esclusa' },
                    assistance: { en: 'Requesting bridge opening for 12:00 passage', es: 'Solicito apertura del puente levadizo para el paso de las 12:00' },
                    target: { en: 'Bridge Control', es: 'Control de Puente' },
                    response: { en: 'Roger, bridge will open at 12:00.', es: 'Recibido, el puente abrirá a las 12:00.' }
                }
            ]
        },
        {
            id: 'radiocheck',
            label: { en: 'Radio Check', es: 'Prueba de Radio' },
            scenarios: [
                {
                    id: 'check',
                    label: { en: 'Radio Check', es: 'Prueba de Radio' },
                    assistance: { en: 'Calling for radio check, how do you copy?', es: 'Llamando para prueba de radio, ¿cómo me recibe?' },
                    target: { en: 'Any Station', es: 'Cualquier Estación' },
                    response: { en: 'Read you 5 by 5 (loud and clear)', es: 'Le recibo 5 de 5 (fuerte y claro)' }
                }
            ]
        }
    ];

const EXAM_EXAMPLES: { title: Record<Language, string>; script: Record<Language, string> }[] = [
    {
        title: { en: 'Distress (Mayday)', es: 'Socorro (Mayday)' },
        script: {
            es: "MAYDAY MAYDAY MAYDAY\nAquí (ó Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nmi posición es 36º 5’ N 3º 25’ W\nTengo fuego a bordo\nNecesito auxilio",
            en: "MAYDAY MAYDAY MAYDAY\nThis is (or Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nMy position is 36º 5’ N 3º 25’ W\nI have fire on board\nI require assistance"
        }
    },
    {
        title: { en: 'Distress Relay', es: 'Retransmisión (Relay)' },
        script: {
            es: "MAYDAY-RELAY MAYDAY-RELAY MAYDAY-RELAY\nAquí (ó Delta Echo)\nALBORADA ALBORADA ALBORADA\nMAYDAY AGALAM\nAGALAM posición 36º 5’ N 3º 25’ W\nFuego a bordo\nNecesita auxilio",
            en: "MAYDAY-RELAY MAYDAY-RELAY MAYDAY-RELAY\nThis is (or Delta Echo)\nALBORADA ALBORADA ALBORADA\nMAYDAY AGALAM\nAGALAM position 36º 5’ N 3º 25’ W\nFire on board\nRequires assistance"
        }
    },
    {
        title: { en: 'Acknowledge (Ack)', es: 'Acuse de Recibo' },
        script: {
            es: "MAYDAY\nAGALAM AGALAM AGALAM\nAquí (ó Delta Echo)\nUTAM UTAM UTAM\nRECIBIDO MAYDAY\nUTAM situación es 36º 5’ N 3º 32’ W\nMi rumbo hacia AGALAM es 90º\nEspero llegar en 1 hora",
            en: "MAYDAY\nAGALAM AGALAM AGALAM\nThis is (or Delta Echo)\nUTAM UTAM UTAM\nRECEIVED MAYDAY\nUTAM position is 36º 5’ N 3º 32’ W\nMy course to AGALAM is 090º\nI expect to arrive in 1 hour"
        }
    },
    {
        title: { en: 'Silence Call', es: 'Petición de Silencio' },
        script: {
            es: "MAYDAY\nCHARLIE-QUEBEC x3\nAquí (ó Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nSILENCE MAYDAY AGALAM",
            en: "MAYDAY\nCHARLIE-QUEBEC x3\nThis is (or Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nSILENCE MAYDAY AGALAM"
        }
    },
    {
        title: { en: 'End Traffic (Prudence)', es: 'Fin del Tráfico (Prudence)' },
        script: {
            es: "MAYDAY\nCHARLIE-QUEBEC x3\nAquí (ó Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nPRUDENCE",
            en: "MAYDAY\nCHARLIE-QUEBEC x3\nThis is (or Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nPRUDENCE"
        }
    },
    {
        title: { en: 'End Traffic (Fini)', es: 'Fin del Tráfico (Fini)' },
        script: {
            es: "MAYDAY\nCHARLIE-QUEBEC x3\nAquí (ó Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nSILENCE FINI",
            en: "MAYDAY\nCHARLIE-QUEBEC x3\nThis is (or Delta Echo)\nAGALAM AGALAM AGALAM\nMAYDAY AGALAM\nSILENCE FINI"
        }
    },
    {
        title: { en: 'Urgency (Pan-Pan)', es: 'Urgencia (Pan-Pan)' },
        script: {
            es: "PAN-PAN PAN-PAN PAN-PAN\nAquí (ó Delta Echo)\nAGALAM AGALAM AGALAM\nPAN-PAN AGALAM\nmi posición es 36º 5’ N 3º 25’ W\nTengo avería en motor principal\nNecesito remolque",
            en: "PAN-PAN PAN-PAN PAN-PAN\nThis is (or Delta Echo)\nAGALAM AGALAM AGALAM\nPAN-PAN AGALAM\nMy position is 36º 5’ N 3º 25’ W\nI have a breakdown in main engine\nI require a tow"
        }
    },
    {
        title: { en: 'Routine: Initial Hailing', es: 'Rutina: Llamada Inicial' },
        script: {
            es: "Puerto Deportivo de l'Escala, Puerto Deportivo de l'Escala, Puerto Deportivo de l'Escala.\nAquí Velero Siroco.\n¿Me recibe? Cambio.",
            en: "L'Escala Marina, L'Escala Marina, L'Escala Marina.\nThis is Sailing Vessel Siroco.\nDo you copy? Over."
        }
    },
    {
        title: { en: 'Routine: Requesting Port Entry', es: 'Rutina: Información y Atraque' },
        script: {
            es: "Puerto Deportivo de l'Escala.\nAquí Velero Siroco.\nMi posición es bocana del puerto.\nSolicito permiso para entrar y instrucciones de atraque.\nEslora 12 metros, calado 2 metros.\nCambio.",
            en: "L'Escala Marina.\nThis is Sailing Vessel Siroco.\nMy position is harbor entrance.\nRequesting entry permission and docking instructions.\nLength 12 meters, draft 2 meters.\nOver."
        }
    },
];

const PRO_WORDS: { w: string; d: Record<Language, string> }[] = [
    { w: 'ROGER', d: { en: 'Received and understood.', es: 'Recibido y comprendido.' } },
    { w: 'WILCO', d: { en: 'Will comply with your instructions.', es: 'Cumpliré con sus instrucciones.' } },
    { w: 'OVER', d: { en: 'Finished speaking, expecting response.', es: 'He terminado de hablar y espero respuesta.' } },
    { w: 'OUT', d: { en: 'Finished, no response expected.', es: 'He terminado la comunicación y no espero respuesta.' } },
    { w: 'SAY AGAIN', d: { en: 'Please repeat your message.', es: 'Por favor, repita el mensaje.' } },
    { w: 'THIS IS', d: { en: 'Used to identify the calling station.', es: 'Usado para identificar la estación que llama.' } },
    { w: 'STATION CALLING', d: { en: 'Used when caller is unknown.', es: 'Para cuando no sabes quién llama.' } },
    { w: 'DELTA ECHO', d: { en: 'Identifying "This is" (International DE).', es: 'Aquí / Identificación (Equivalente a DE).' } },
    { w: 'VICTOR ALFA', d: { en: 'End of work (International VA).', es: 'Terminado (Equivalente a VA).' } },
    { w: 'SILENCE MAYDAY', d: { en: 'Impose radio silence.', es: 'Señal para imponer silencio radio.' } },
    { w: 'PRUDENCE', d: { en: 'Restricted traffic resumed.', es: 'Reanudación restringida del tráfico.' } },
    { w: 'SILENCE FINI', d: { en: 'End of distress traffic.', es: 'Fin del tráfico de socorro.' } },
];

const CHANNELS = [
    { ch: '16', d: { en: 'Distress, Safety and Calling', es: 'Socorro, Seguridad y Llamada' }, color: '#ef4444' },
    { ch: '09', d: { en: 'Primary Calling (US)', es: 'Llamada Primaria (EEUU)' }, color: '#38bdf8' },
    { ch: '13', d: { en: 'Bridge-to-Bridge (Navigation)', es: 'Puente a Puente (Navegación)' }, color: '#fbbf24' },
    { ch: '22A', d: { en: 'Coast Guard Liaison', es: 'Enlace con Guardacostas' }, color: '#f87171' },
    { ch: '68/69/72', d: { en: 'Working Channels', es: 'Canales de Trabajo' }, color: '#34d399' },
];

const MARITIME_NUMBERS: { n: string; p: string }[] = [
    { n: '0', p: 'ZERO' }, { n: '1', p: 'WUN' }, { n: '2', p: 'TOO' },
    { n: '3', p: 'TREE' }, { n: '4', p: 'FOW-ER' }, { n: '5', p: 'FIFE' },
    { n: '6', p: 'SIX' }, { n: '7', p: 'SEV-EN' }, { n: '8', p: 'AIT' },
    { n: '9', p: 'NINER' }, { n: '.', p: 'DECIMAL' }, { n: ',', p: 'DECIMAL' },
];

const toPhonetic = (text: string, lang: Language) => {
    const mapEs: any = { '0': 'Cero', '1': 'Uno', '2': 'Dos', '3': 'Tres', '4': 'Cuatro', '5': 'Cinco', '6': 'Seis', '7': 'Siete', '8': 'Ocho', '9': 'Nueve', 'º': ' grados', "'": ' minutos', 'N': ' Norte', 'S': ' Sur', 'E': ' Este', 'W': ' Oeste' };
    const mapEn: any = { '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', 'º': ' degrees', "'": ' minutes', 'N': ' North', 'S': ' South', 'E': ' East', 'W': ' West' };
    const map = lang === 'es' ? mapEs : mapEn;
    return text.split('').map(c => map[c] || c).join('-').replace(/- /g, ' ').replace(/ -/g, ' ').replace(/--/g, '-');
};

const DISTRESS_PROBLEMS: { id: string; label: Record<Language, string> }[] = [
    { id: 'fire', label: { en: 'Uncontrolled Fire', es: 'Incendio incontrolado' } },
    { id: 'flooding', label: { en: 'Massive Flooding / Sinking', es: 'Hundimiento / Vía de agua masiva' } },
    { id: 'collision', label: { en: 'Severe Collision', es: 'Colisión grave' } },
    { id: 'mob', label: { en: 'Person Overboard (Immediate Danger)', es: 'Hombre al agua (con peligro inmediato)' } },
    { id: 'medical_critical', label: { en: 'Critical Medical Emergency', es: 'Emergencia médica crítica' } },
];

const URGENCY_PROBLEMS: { id: string; label: Record<Language, string> }[] = [
    { id: 'engine', label: { en: 'Main Engine Failure', es: 'Fallo de motor' } },
    { id: 'propeller', label: { en: 'Obstructed Propeller', es: 'Hélice obstruida' } },
    { id: 'mast', label: { en: 'Mast / Dismantling', es: 'Desarboladura' } },
    { id: 'medical_nonvital', label: { en: 'Non-vital Medical Emergency', es: 'Emergencia médica no vital' } },
    { id: 'search', label: { en: 'Search for Castaway', es: 'Búsqueda de náufrago' } },
];

const SAFETY_PROBLEMS: { id: string; label: Record<Language, string> }[] = [
    { id: 'objects', label: { en: 'Drifting Objects', es: 'Objetos a la deriva' } },
    { id: 'signaling', label: { en: 'Signaling / Lighthouse Failure', es: 'Avería en señalización' } },
    { id: 'restricted', label: { en: 'Restricted Maneuver', es: 'Maniobra restringida' } },
    { id: 'weather', label: { en: 'Dangerous Weather / Dense Fog', es: 'Meteorología peligrosa' } },
];

const TRANSLATIONS: Record<Language, any> = {
    en: {
        simulatorTitle: "Radio",
        simulatorTitleSub: "Simulator",
        standardPhrases: "Standard Marine Communication Phrases",
        onboardingTitle: "Vessel Setup",
        onboardingSub: "Configure your station details",
        vesselNameLabel: "Vessel Name",
        mmsiLabel: "MMSI",
        callSignLabel: "Call Sign",
        mmsiPlaceholder: "9 digits",
        callSignPlaceholder: "Call Sign",
        protocolTitle: "Priority Level",
        protocolSub: "Select the communication type",
        scriptTitle: "Radio Script Builder",
        positionLabel: "My position is",
        useGps: "Use Global Positioning",
        positionPlaceholder: "Coordinates or Landmark...",
        problemLabel: "Nature of Distress / Info",
        soulsLabel: "P.O.B.",
        soulsPlaceholder: "Number of persons",
        assistanceLabel: "Assistance Requested",
        infoLabel: "Useful Information",
        generatedCommand: "Generated Script",
        thisIs: "This is (or Delta Echo)",
        over: "Over",
        copy: "Do you copy?",
        switching: "Switching to",
        standingBy: "Standing by",
        listenWarn: "Listen on CH 16 for 5 seconds before talking.",
        briefWarn: "Speak clearly and be brief.",
        radioCheckTip: "NavAI Tip: To test your radio, call a nearby marina or another vessel on channel 9. Do not use channel 16 for routine tests if other options exist.",
        workingChannelLabel: "Working Channel",
        routinePhaseHailing: "Initial Hailing (CH 16)",
        routinePhaseInfo: "Information Traffic",
        routineCategoryLabel: "Communication Type",
        routineScenarioLabel: "Scenario",
        routineGuideTitle: "Routine Call Procedure",
        routineGuideStep1: "1. Select Channel 16: International frequency for emergency, safety and calls. Use it for initial contact.",
        routineGuideStep2: "2. Initial Hailing: Call the station 3 times. Example: '[Target] x3, this is [Me], change.'",
        routineGuideStep3: "3. Wait for Response: Wait for instructions or a channel jump request.",
        routineGuideStep4: "4. Switch to Working Channel: Move to the designated channel (e.g., 09 for Marinas) for details.",
        routineGuideStep5: "5. Provide Info: Position, intentions, and vessel details (length, draft).",
        routineGuideTip: "Escucha 5s antes de hablar para no pisar a nadie.",
        warning: "THIS IS A SIMULATOR. DO NOT EMIT ON REAL RADIO.",
        toolboxTitle: "Radio Toolbox",
        toolboxSub: "Reference Materials",
        natoTitle: "Phonetic Alphabet",
        proWordsTitle: "Prowords",
        silenceTitle: "Silence Periods",
        silenceText: "Maintain radio silence on CH 16 for the first 3 mins of every hour.",
        back: "Back",
        continue: "Continue",
        newSim: "Reset",
        channelsTitle: "Channel Guide",
        targetLabel: "Target Station (Vessel/Marina)",
        me: "Me",
        vesselNameLabelShort: "NAME",
        callSignLabelShort: "CALL SIGN",
        validationMmsi: "Spanish MMSI starts with 224",
        validationCallsign: "Spanish Callsign starts with EA/EB",
        voicePhase: "VOICE SCRIPT",
        timeLabel: "UTC TIME",
        checklistTitle: "Pre-talk Checklist",
        ch16Label: "CH 16 Selected?",
        paperLabel: "Paper & Pen ready?",
        numbersTitle: "Radio Numbers",
        examplesTitle: "Radio Examples",
        viewResponse: "View Expected Response",
        viewMyScript: "View My Script",
        responseFrom: "Response from",
        coastGuard: "Coast Guard / MRCC",
        marinaPort: "Marina / Port Control",
        otherVessel: "Other Vessel",
        switchChannel: "Switch to Working Channel",
    },
    es: {
        simulatorTitle: "Simulador",
        simulatorTitleSub: "de Radio",
        standardPhrases: "Comunicaciones PNB / PER Oficiales",
        onboardingTitle: "Configuración",
        onboardingSub: "Identificación de la estación",
        vesselNameLabel: "Nombre del Buque",
        mmsiLabel: "MMSI",
        callSignLabel: "Distintivo",
        mmsiPlaceholder: "9 dígitos",
        callSignPlaceholder: "Distintivo",
        protocolTitle: "Prioridad",
        protocolSub: "Tipo de llamada",
        scriptTitle: "Constructor de Mensaje",
        positionLabel: "mi posición es",
        useGps: "Auto GPS",
        positionPlaceholder: "Coordenadas o Referencia...",
        problemLabel: "Naturaleza / Información",
        soulsLabel: "Nº Personas",
        soulsPlaceholder: "Nº personas",
        assistanceLabel: "Asistencia",
        infoLabel: "Utilidad",
        generatedCommand: "Guion Procedural",
        thisIs: "Aquí (ó Delta Echo)",
        over: "Cambio",
        copy: "¿Me recibe?",
        switching: "Cambio al canal",
        standingBy: "espero su respuesta",
        listenWarn: "Escucha el canal 16 durante 5 segundos antes de hablar.",
        briefWarn: "Sé breve y habla con claridad.",
        radioCheckTip: "NavAI Tip: Para probar tu radio, llama a una marina cercana o a otro barco en el canal 9. No uses el canal 16 para pruebas de rutina si tienes otras opciones.",
        workingChannelLabel: "Canal de Trabajo",
        routinePhaseHailing: "Llamada Inicial (Canal 16)",
        routinePhaseInfo: "Tráfico de Información",
        routineCategoryLabel: "Tipo de Comunicación",
        routineScenarioLabel: "Asunto de la Llamada",
        routineGuideTitle: "Procedimiento de Rutina",
        routineGuideStep1: "1. Sintoniza Canal 16: Frecuencia internacional de socorro y llamada. Úsala para el contacto inicial.",
        routineGuideStep2: "2. Llamada Inicial: Llama al puerto/barco 3 veces. Ejemplo: '[Nombre] x3, aquí [Yo], cambio.'",
        routineGuideStep3: "3. Espera Respuesta: El puerto te indicará si puedes seguir o si debes saltar de canal.",
        routineGuideStep4: "4. Canal de Trabajo: Cambia al canal designado (ej. 09 para Marinas) para detalles.",
        routineGuideStep5: "5. Información: Proporciona posición, intenciones y detalles (eslora, calado).",
        routineGuideTip: "Escucha 5s antes de hablar para no pisar a nadie.",
        warning: "SIMULADOR EDUCATIVO. NO USAR EN RADIO REAL.",
        toolboxTitle: "Radio Toolbox",
        toolboxSub: "Ayuda al estudio",
        natoTitle: "Alfabeto NATO",
        proWordsTitle: "Prowords PNB",
        silenceTitle: "Reloj de Silencio",
        silenceText: "Silencio radio en CH 16 los primeros 3 min de cada hora.",
        back: "Atrás",
        continue: "Continuar",
        newSim: "Reiniciar",
        channelsTitle: "Canales VHF",
        targetLabel: "Estación Destino",
        me: "Yo",
        vesselNameLabelShort: "NOMBRE",
        callSignLabelShort: "DISTINTIVO",
        validationMmsi: "MMSI español empieza por 224",
        validationCallsign: "Distintivo español empieza por EA/EB",
        voicePhase: "GUION DE FONÍA",
        timeLabel: "HORA UTC",
        checklistTitle: "Antes de hablar",
        ch16Label: "¿Canal 16 seleccionado?",
        paperLabel: "¿Papel y boli listos?",
        numbersTitle: "Cantado de Números",
        examplesTitle: "Ejemplos de Radio",
        viewResponse: "Ver Respuesta Esperada",
        viewMyScript: "Ver Mi Guion",
        responseFrom: "Respuesta de",
        coastGuard: "Salvamento Marítimo / CCS",
        marinaPort: "Marina / Control de Puerto",
        otherVessel: "Otro Barco",
        switchChannel: "Cambiar al Canal de Trabajo",
    }
};

export default function RadioSimulator() {
    const [state, setState] = useState<RadioState>({
        step: 0, // 0 is Language Selector
        language: 'en',
        vessel: { name: '', mmsi: '', callSign: '' },
        targetVessel: '',
        protocol: null,
        message: { position: '', problem: 'flooding', peopleOnBoard: '', assistance: '', routineScenario: 'docking', routinePhase: 0 },
        showResponse: false
    });

    const [checklist, setChecklist] = useState({
        ch16: false,
        paper: false
    });

    const [showToolbox, setShowToolbox] = useState<boolean>(false);

    // --- Logic ---

    const nextStep = () => setState(prev => ({ ...prev, step: prev.step + 1 }));
    const prevStep = () => setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }));

    const t = TRANSLATIONS[state.language];

    useEffect(() => {
        if (state.protocol) {
            let defaultProblem = '';
            if (state.protocol === 'distress') defaultProblem = DISTRESS_PROBLEMS[0].id;
            if (state.protocol === 'urgency') defaultProblem = URGENCY_PROBLEMS[0].id;
            if (state.protocol === 'safety') defaultProblem = SAFETY_PROBLEMS[0].id;

            if (defaultProblem) {
                setState(s => ({ ...s, message: { ...s.message, problem: defaultProblem } }));
            }
        }
    }, [state.protocol]);

    const generatedScript = useMemo(() => {
        if (!state.protocol) return "";
        const p = PROTOCOLS.find(pr => pr.id === state.protocol);

        const target = state.targetVessel.toUpperCase() || 'ALL STATIONS';
        const targetRepeat = `${target}, ${target}, ${target}`;

        const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';
        const vMmsi = state.vessel.mmsi || '[MMSI]';
        const vCallSign = state.vessel.callSign.toUpperCase() || '[CALL SIGN]';
        const time = new Date().toISOString().substring(11, 16) + " UTC";

        // Routine Call Pattern
        if (state.protocol === 'routine') {
            const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
            const target = scenario?.target[state.language].toUpperCase() || state.targetVessel.toUpperCase() || '[TARGET]';
            const workCh = scenario?.workingChannel;
            const targetCall = `${target}, ${target}, ${target}`;

            if (state.message.routinePhase === 0) {
                // Initial Hailing (CH 16)
                if (state.language === 'es') {
                    return `[ ${t.routinePhaseHailing} ]\n${targetCall}.\nAquí ${vName}.\n${t.over.toUpperCase()}.`;
                }
                return `[ ${t.routinePhaseHailing} ]\n${targetCall}.\nThis is ${vName}.\n${t.over.toUpperCase()}.`;
            } else {
                // Info Traffic (Working CH)
                const pos = state.message.position || '';
                const assistance = scenario?.assistance[state.language] || state.message.assistance || '[INTENTIONS/INFO]';
                const chInfo = workCh ? ` (CH ${workCh})` : "";

                if (state.language === 'es') {
                    return `[ ${t.routinePhaseInfo}${chInfo} ]\n${target}.\nAquí ${vName}.\n${pos ? `Mi posición es ${pos}.\n` : ''}${assistance}.\n${t.over.toUpperCase()}.`;
                }
                return `[ ${t.routinePhaseInfo}${chInfo} ]\n${target}.\nThis is ${vName}.\n${pos ? `My position is ${pos}.\n` : ''}${assistance}.\n${t.over.toUpperCase()}.`;
            }
        }

        const proword = p?.proword || '';
        const repeat = `${proword}, ${proword}, ${proword}`;
        const vRepeat = `${vName}, ${vName}, ${vName}`;

        if (state.protocol === 'distress') {
            const nature = DISTRESS_PROBLEMS.find(pr => pr.id === state.message.problem)?.label[state.language] || '[PROBLEM]';
            const pos = state.message.position || '[COORDINATES]';
            const posPhonetic = toPhonetic(pos, state.language);
            const people = state.message.peopleOnBoard || '[Nº]';

            if (state.language === 'es') {
                return `[ ${t.voicePhase} ]\nMAYDAY, MAYDAY, MAYDAY. Aquí ${vRepeat}.\nMAYDAY ${vName}.\nMi posición es ${pos}.\n(${posPhonetic})\nNaturaleza del peligro: ${nature}.\nNecesito asistencia inmediata. Somos ${people} a bordo.\n${t.over.toUpperCase()}.`;
            }
            return `[ ${t.voicePhase} ]\nMAYDAY, MAYDAY, MAYDAY. This is ${vRepeat}.\nMAYDAY ${vName}.\nMy position is ${pos}.\n(${posPhonetic})\nNature of distress: ${nature}.\nI require immediate assistance. We are ${people} on board.\n${t.over.toUpperCase()}.`;
        }

        if (state.protocol === 'urgency') {
            const nature = URGENCY_PROBLEMS.find(pr => pr.id === state.message.problem)?.label[state.language] || '[PROBLEM]';
            const pos = state.message.position || '[COORDINATES]';
            const assistance = state.message.assistance || '[ASSISTANCE]';
            const posPhonetic = toPhonetic(pos, state.language);

            if (state.language === 'es') {
                return `[ ${t.voicePhase} ]\nPAN-PAN, PAN-PAN, PAN-PAN. A todas las estaciones.\nAquí ${vRepeat}.\nMi posición es ${pos}.\n(${posPhonetic})\nTenemos ${nature}.\nSolicitamos ${assistance}.\n${t.over.toUpperCase()}.`;
            }
            return `[ ${t.voicePhase} ]\nPAN-PAN, PAN-PAN, PAN-PAN. To all stations.\nThis is ${vRepeat}.\nMy position is ${pos}.\n(${posPhonetic})\nWe have ${nature}.\nWe request ${assistance}.\n${t.over.toUpperCase()}.`;
        }

        if (state.protocol === 'safety') {
            const nature = SAFETY_PROBLEMS.find(pr => pr.id === state.message.problem)?.label[state.language] || '[PROBLEM]';
            const pos = state.message.position || '[COORDINATES]';
            const posPhonetic = toPhonetic(pos, state.language);

            if (state.language === 'es') {
                return `[ ${t.voicePhase} ]\nSECURITÉ, SECURITÉ, SECURITÉ. A todas las estaciones.\nAquí ${vRepeat}.\nSe informa de ${nature}.\nEn la posición ${pos}.\n(${posPhonetic})\nSe recomienda navegar con precaución.\n${t.over.toUpperCase()}.`;
            }
            return `[ ${t.voicePhase} ]\nSECURITÉ, SECURITÉ, SECURITÉ. To all stations.\nThis is ${vRepeat}.\nReporting ${nature}.\nAt position ${pos}.\n(${posPhonetic})\nCautious navigation is recommended.\n${t.over.toUpperCase()}.`;
        }

        // Routine fallback
        return `[ ROUTINE ]\n${targetRepeat}\n${t.thisIs.toUpperCase()} ${vName}\n${t.over.toUpperCase()}.`;
    }, [state, t]);

    const stationResponse = useMemo(() => {
        if (!state.protocol) return "";
        const target = state.targetVessel.toUpperCase() || (state.protocol === 'routine' ? t.marinaPort : t.coastGuard);
        const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';

        if (state.protocol === 'distress') {
            if (state.language === 'es') {
                return `[ ${t.responseFrom} ${t.coastGuard} ]\nMAYDAY ${vName}.\nAquí SALVAMENTO MARÍTIMO.\nRecibido su MAYDAY.\nProcedemos al rescate. Mantenga escucha.\nCAMBIO.`;
            }
            return `[ ${t.responseFrom} ${t.coastGuard} ]\nMAYDAY ${vName}.\nThis is COAST GUARD.\nReceived your MAYDAY.\nProceeding to rescue. Stand by.\nOVER.`;
        }

        if (state.protocol === 'urgency') {
            if (state.language === 'es') {
                return `[ ${t.responseFrom} ${t.coastGuard} ]\nPAN-PAN ${vName}.\nAquí SALVAMENTO MARÍTIMO.\nRecibido su PAN-PAN.\nMantenga escucha para más instrucciones.\nCAMBIO.`;
            }
            return `[ ${t.responseFrom} ${t.coastGuard} ]\nPAN-PAN ${vName}.\nThis is COAST GUARD.\nReceived your PAN-PAN.\nStand by for further instructions.\nOVER.`;
        }

        if (state.protocol === 'routine') {
            const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
            const target = scenario?.target[state.language].toUpperCase() || (state.protocol === 'routine' ? t.marinaPort : t.coastGuard);
            const workCh = scenario?.workingChannel;

            if (state.message.routinePhase === 0) {
                const response = scenario?.response[state.language] || (state.language === 'es' ? `Recibido, cambie al canal ${workCh || '09'}.` : `Roger, switch to channel ${workCh || '09'}.`);
                if (state.language === 'es') {
                    return `[ ${t.responseFrom} ${target} ]\n${vName}.\nAquí ${target}.\n${response}\nCAMBIO.`;
                }
                return `[ ${t.responseFrom} ${target} ]\n${vName}.\nThis is ${target}.\n${response}\nOVER.`;
            } else {
                const response = scenario?.response[state.language] || (state.language === 'es' ? "Recibido sus intenciones." : "Received your intentions.");
                if (state.language === 'es') {
                    return `[ ${t.responseFrom} ${target} ]\n${vName}.\nAquí ${target}.\n${response}\nTERMINADO.`;
                }
                return `[ ${t.responseFrom} ${target} ]\n${vName}.\nThis is ${target}.\n${response}\nOUT.`;
            }
        }

        if (state.protocol === 'safety') {
            if (state.language === 'es') {
                return `[ ${t.responseFrom} ${t.otherVessel} ]\n${vName}.\nAquí OTRO BARCO.\nRecibido su aviso de seguridad.\nNavegamos con precaución.\nTERMINADO.`;
            }
            return `[ ${t.responseFrom} ${t.otherVessel} ]\n${vName}.\nThis is OTHER VESSEL.\nReceived your safety notice.\nWe are navigating with caution.\nOUT.`;
        }

        return "";
    }, [state, t]);



    // --- Renderers ---

    const renderLanguageSelector = () => (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500 text-center py-10">
            <div className="space-y-4">
                <div className="w-20 h-20 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto text-maritime-ocean">
                    <Globe className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-light text-maritime-brass">{t.simulatorTitle} <span className="font-black italic">{t.simulatorTitleSub}</span></h2>
                <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">{t.standardPhrases}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-md mx-auto">
                <button
                    onClick={() => setState(s => ({ ...s, language: 'en', step: 1 }))}
                    className="flex-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all group"
                >
                    <span className="block text-2xl font-black mb-2 transition-transform group-hover:scale-110">ENGLISH</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Global Maritime Standard</span>
                </button>
                <button
                    onClick={() => setState(s => ({ ...s, language: 'es', step: 1 }))}
                    className="flex-1 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all group"
                >
                    <span className="block text-2xl font-black mb-2 transition-transform group-hover:scale-110">ESPAÑOL</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Comunicaciones en Español</span>
                </button>
            </div>

            <div className="max-w-md mx-auto w-full">
                <button
                    onClick={() => setShowToolbox(true)}
                    className="w-full p-6 bg-maritime-brass/10 border border-maritime-brass/20 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-maritime-brass/20 transition-all group/concepts"
                >
                    <HelpCircle className="w-5 h-5 text-maritime-brass group-hover/concepts:rotate-12 transition-transform" />
                    <span className="font-black text-maritime-brass uppercase tracking-widest text-xs">Radio Toolbox</span>
                </button>
            </div>
        </div>
    );

    const renderOnboarding = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-maritime-ocean/10 rounded-full flex items-center justify-center mx-auto text-maritime-ocean">
                    <Anchor className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-maritime-brass">{t.onboardingTitle}</h3>
                <p className="text-sm text-white/50">{t.onboardingSub}</p>
            </div>

            <div className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.vesselNameLabel} ({t.me})</label>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                        <Ship className="w-5 h-5 text-maritime-ocean" />
                        <input
                            placeholder="e.g. SIROCO"
                            className="bg-transparent border-none outline-none text-white w-full font-bold uppercase transition-all"
                            value={state.vessel.name}
                            onChange={e => setState(s => ({ ...s, vessel: { ...s.vessel, name: e.target.value } }))}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.targetLabel}</label>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-brass transition-all">
                        <Radio className="w-5 h-5 text-maritime-brass" />
                        <input
                            placeholder="e.g. LADY GREY"
                            className="bg-transparent border-none outline-none text-white w-full font-bold uppercase transition-all"
                            value={state.targetVessel}
                            onChange={e => setState(s => ({ ...s, targetVessel: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.mmsiLabel}</label>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all relative">
                            <Hash className="w-4 h-4 text-maritime-teal" />
                            <input
                                placeholder={t.mmsiPlaceholder}
                                maxLength={9}
                                className="bg-transparent border-none outline-none text-white w-full font-mono text-xs"
                                value={state.vessel.mmsi}
                                onChange={e => setState(s => ({ ...s, vessel: { ...s.vessel, mmsi: e.target.value } }))}
                            />
                            {state.language === 'es' && state.vessel.mmsi && !state.vessel.mmsi.startsWith('224') && (
                                <div className="absolute -bottom-6 left-0 text-[7px] text-orange-500 font-bold uppercase tracking-tighter">
                                    {t.validationMmsi}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.callSignLabel}</label>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all relative">
                            <Key className="w-4 h-4 text-maritime-teal" />
                            <input
                                placeholder={t.callSignPlaceholder}
                                className="bg-transparent border-none outline-none text-white w-full font-mono text-xs uppercase"
                                value={state.vessel.callSign}
                                onChange={e => setState(s => ({ ...s, vessel: { ...s.vessel, callSign: e.target.value } }))}
                            />
                            {state.language === 'es' && state.vessel.callSign && !state.vessel.callSign.toUpperCase().startsWith('E') && (
                                <div className="absolute -bottom-6 left-0 text-[7px] text-orange-500 font-bold uppercase tracking-tighter">
                                    {t.validationCallsign}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProtocolSelector = () => (
        <div className="space-y-10 animate-in slide-in-from-right fade-in duration-300">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-maritime-brass/10 rounded-full flex items-center justify-center mx-auto text-maritime-brass">
                    <Radio className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-light text-maritime-brass">{t.protocolTitle}</h3>
                <p className="text-sm text-white/50">{t.protocolSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROTOCOLS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => setState(s => ({ ...s, protocol: p.id, step: 3 }))}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 group relative overflow-hidden ${state.protocol === p.id
                            ? 'bg-white/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:scale-[1.02]'}`}
                        style={{
                            borderColor: state.protocol === p.id ? p.color : 'transparent',
                            boxShadow: state.protocol === p.id ? `0 0 20px ${p.color}33` : 'none'
                        }}
                    >
                        <div className="p-4 rounded-2xl bg-white/5" style={{ color: p.color }}>
                            <p.icon className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                            <span className="block font-black text-xl tracking-tighter" style={{ color: p.color }}>{p.sub}</span>
                            <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest">{p.labels[state.language]}</span>
                        </div>
                        <ChevronRight className="absolute right-6 w-5 h-5 opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderScriptGenerator = () => (
        <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl" style={{ color: PROTOCOLS.find(p => p.id === state.protocol)?.color }}>
                        {React.createElement(PROTOCOLS.find(p => p.id === state.protocol)?.icon || Radio, { className: "w-6 h-6" })}
                    </div>
                    <div>
                        <h4 className="font-black text-xl uppercase italic tracking-tighter" style={{ color: PROTOCOLS.find(p => p.id === state.protocol)?.color }}>
                            {PROTOCOLS.find(p => p.id === state.protocol)?.sub} Script
                        </h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">{t.scriptTitle}</p>
                    </div>
                </div>
            </div>



            {/* Pre-talk Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={() => setChecklist(c => ({ ...c, ch16: !c.ch16 }))}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${checklist.ch16 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 ${checklist.ch16 ? 'bg-green-500 border-green-500 text-maritime-midnight' : 'border-white/20'}`}>
                        {checklist.ch16 && <Check className="w-3 h-3 font-bold" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${checklist.ch16 ? 'text-green-500' : 'text-white/40'}`}>{t.ch16Label}</span>
                </button>
                <button
                    onClick={() => setChecklist(c => ({ ...c, paper: !c.paper }))}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${checklist.paper ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 ${checklist.paper ? 'bg-green-500 border-green-500 text-maritime-midnight' : 'border-white/20'}`}>
                        {checklist.paper && <Check className="w-3 h-3 font-bold" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${checklist.paper ? 'text-green-500' : 'text-white/40'}`}>{t.paperLabel}</span>
                </button>
            </div>

            {/* Routine Checklist Note (Conditional) */}
            {state.protocol === 'routine' && (
                <div className="p-4 bg-maritime-ocean/10 border border-maritime-ocean/20 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-maritime-ocean" />
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{t.listenWarn}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-maritime-ocean" />
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{t.briefWarn}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-4">
                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest">{t.positionLabel}</label>
                            <button
                                onClick={() => setState(s => ({ ...s, message: { ...s.message, position: "40º 42' N, 074º 00' W" } }))}
                                className="text-[8px] uppercase font-bold text-maritime-ocean hover:text-white transition-colors"
                            >
                                {t.useGps}
                            </button>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                            <textarea
                                placeholder={t.positionPlaceholder}
                                className="bg-transparent border-none outline-none text-white w-full h-20 text-sm font-mono resize-none"
                                value={state.message.position}
                                onChange={e => setState(s => ({ ...s, message: { ...s.message, position: e.target.value } }))}
                            />
                        </div>
                    </div>

                    {state.protocol !== 'routine' && (
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.problemLabel}</label>
                            <select
                                className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 outline-none text-white text-sm appearance-none cursor-pointer"
                                value={state.message.problem}
                                onChange={e => setState(s => ({ ...s, message: { ...s.message, problem: e.target.value } }))}
                            >
                                {state.protocol === 'distress' && DISTRESS_PROBLEMS.map(p => <option key={p.id} value={p.id} className="bg-maritime-midnight">{p.label[state.language]}</option>)}
                                {state.protocol === 'urgency' && URGENCY_PROBLEMS.map(p => <option key={p.id} value={p.id} className="bg-maritime-midnight">{p.label[state.language]}</option>)}
                                {state.protocol === 'safety' && SAFETY_PROBLEMS.map(p => <option key={p.id} value={p.id} className="bg-maritime-midnight">{p.label[state.language]}</option>)}
                            </select>
                        </div>
                    )}

                    {state.protocol !== 'routine' && (
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.soulsLabel}</label>
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                                <input
                                    placeholder={t.soulsPlaceholder}
                                    type="number"
                                    className="bg-transparent border-none outline-none text-white w-full font-bold"
                                    value={state.message.peopleOnBoard}
                                    onChange={e => setState(s => ({ ...s, message: { ...s.message, peopleOnBoard: e.target.value } }))}
                                />
                            </div>
                        </div>
                    )}

                    {state.protocol === 'routine' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.routineCategoryLabel}</label>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                                    <select
                                        className="w-full bg-transparent border-none outline-none text-white font-bold cursor-pointer appearance-none"
                                        value={ROUTINE_CATEGORIES.find(c => c.scenarios.some(s => s.id === state.message.routineScenario))?.id}
                                        onChange={e => {
                                            const cat = ROUTINE_CATEGORIES.find(c => c.id === e.target.value);
                                            if (cat) setState(s => ({ ...s, message: { ...s.message, routineScenario: cat.scenarios[0].id, routinePhase: 0 } }));
                                        }}
                                    >
                                        {ROUTINE_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-maritime-midnight">{cat.label[state.language]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.routineScenarioLabel}</label>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                                    <select
                                        className="w-full bg-transparent border-none outline-none text-white font-bold cursor-pointer appearance-none"
                                        value={state.message.routineScenario}
                                        onChange={e => setState(s => ({ ...s, message: { ...s.message, routineScenario: e.target.value, routinePhase: 0 } }))}
                                    >
                                        {ROUTINE_CATEGORIES.find(c => c.scenarios.some(s => s.id === state.message.routineScenario))?.scenarios.map(sc => (
                                            <option key={sc.id} value={sc.id} className="bg-maritime-midnight">{sc.label[state.language]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-4">{t.assistanceLabel + ' / ' + t.infoLabel}</label>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-maritime-ocean transition-all">
                                <textarea
                                    placeholder="..."
                                    className="bg-transparent border-none outline-none text-white w-full h-20 text-sm font-mono resize-none"
                                    value={state.message.assistance}
                                    onChange={e => setState(s => ({ ...s, message: { ...s.message, assistance: e.target.value } }))}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-[2rem] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase font-black text-maritime-brass tracking-[0.2em]">{t.generatedCommand}</span>
                                {state.protocol !== 'routine' && (
                                    <div className="flex bg-white/5 p-1 rounded-xl mb-4 self-start">
                                        <button
                                            onClick={() => setState(s => ({ ...s, showResponse: false }))}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${!state.showResponse ? 'bg-maritime-brass text-maritime-midnight' : 'text-white/40'}`}
                                        >
                                            {t.viewMyScript}
                                        </button>
                                        <button
                                            onClick={() => setState(s => ({ ...s, showResponse: true }))}
                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${state.showResponse ? 'bg-maritime-ocean text-maritime-midnight shadow-lg' : 'text-white/40'}`}
                                        >
                                            {t.viewResponse}
                                        </button>
                                    </div>
                                )}
                                <Volume2 className="w-4 h-4 text-white/20" />
                            </div>

                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2 space-y-6">
                                {state.protocol === 'routine' ? (
                                    <div className="space-y-6">
                                        {/* Hailing Part */}
                                        <div className="space-y-4">
                                            <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                                <span className="text-[10px] font-black text-white/30 uppercase mb-2 block">{t.routinePhaseHailing}</span>
                                                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-white select-all cursor-copy">
                                                    {(() => {
                                                        const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
                                                        const target = scenario?.target[state.language].toUpperCase() || state.targetVessel.toUpperCase() || '[TARGET]';
                                                        const targetCall = `${target}, ${target}, ${target}`;
                                                        const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';
                                                        if (state.language === 'es') return `${targetCall}.\nAquí ${vName}.\n${t.over.toUpperCase()}.`;
                                                        return `${targetCall}.\nThis is ${vName}.\n${t.over.toUpperCase()}.`;
                                                    })()}
                                                </pre>
                                            </div>

                                            {state.showResponse && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-maritime-ocean/10 p-4 rounded-3xl border border-maritime-ocean/20 ml-6 relative">
                                                    <span className="text-[10px] font-black text-maritime-ocean uppercase mb-2 block">Port / Station Response</span>
                                                    <pre className="text-sm font-bold font-mono whitespace-pre-wrap leading-relaxed text-maritime-ocean select-all cursor-copy">
                                                        {(() => {
                                                            const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
                                                            const target = scenario?.target[state.language].toUpperCase() || t.marinaPort;
                                                            const workCh = scenario?.workingChannel;
                                                            const response = scenario?.response[state.language] || (state.language === 'es' ? `Recibido, cambie al canal ${workCh || '09'}.` : `Roger, switch to channel ${workCh || '09'}.`);
                                                            const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';
                                                            if (state.language === 'es') return `${vName}.\nAquí ${target}.\n${response}\nCAMBIO.`;
                                                            return `${vName}.\nThis is ${target}.\n${response}\nOVER.`;
                                                        })()}
                                                    </pre>

                                                    {state.message.routinePhase === 0 && ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario)?.workingChannel && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setState(s => ({ ...s, message: { ...s.message, routinePhase: 1 } }))}
                                                            className="mt-4 w-full py-3 px-6 rounded-2xl bg-maritime-ocean text-maritime-midnight font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-maritime-ocean/20"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            {t.switchChannel}
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Traffic Part (Visible if phase 1) */}
                                        {state.message.routinePhase === 1 && (
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                                                    <span className="text-[10px] font-black text-white/30 uppercase mb-2 block">{t.routinePhaseInfo}</span>
                                                    <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-white select-all cursor-copy">
                                                        {(() => {
                                                            const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
                                                            const target = scenario?.target[state.language].toUpperCase() || state.targetVessel.toUpperCase() || '[TARGET]';
                                                            const workCh = scenario?.workingChannel;
                                                            const pos = state.message.position || '';
                                                            const assistance = scenario?.assistance[state.language] || state.message.assistance || '[INTENTIONS/INFO]';
                                                            const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';
                                                            const chInfo = workCh ? ` (CH ${workCh})` : "";
                                                            if (state.language === 'es') return `${target}.\nAquí ${vName}.\n${pos ? `Mi posición es ${pos}.\n` : ''}${assistance}.\n${t.over.toUpperCase()}.`;
                                                            return `${target}.\nThis is ${vName}.\n${pos ? `My position is ${pos}.\n` : ''}${assistance}.\n${t.over.toUpperCase()}.`;
                                                        })()}
                                                    </pre>
                                                </div>

                                                {state.showResponse && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-maritime-ocean/10 p-4 rounded-3xl border border-maritime-ocean/20 ml-6">
                                                        <span className="text-[10px] font-black text-maritime-ocean uppercase mb-2 block">Final Port / Station Response</span>
                                                        <pre className="text-sm font-bold font-mono whitespace-pre-wrap leading-relaxed text-maritime-ocean select-all cursor-copy">
                                                            {(() => {
                                                                const scenario = ROUTINE_CATEGORIES.flatMap(c => c.scenarios).find(s => s.id === state.message.routineScenario);
                                                                const target = scenario?.target[state.language].toUpperCase() || t.marinaPort;
                                                                const response = (state.language === 'es' ? "Recibido sus intenciones.\nSiga navegando hacia el punto de atraque." : "Received your intentions.\nProceed to the docking area.");
                                                                const vName = state.vessel.name.toUpperCase() || '[VESSEL NAME]';
                                                                if (state.language === 'es') return `${vName}.\nAquí ${target}.\n${response}\nTERMINADO.`;
                                                                return `${vName}.\nThis is ${target}.\n${response}\nOUT.`;
                                                            })()}
                                                        </pre>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                ) : (
                                    <pre className={`text-sm font-mono whitespace-pre-wrap leading-relaxed select-all cursor-copy ${state.showResponse ? 'text-maritime-ocean font-bold' : 'text-white'}`}>
                                        {state.showResponse ? stationResponse : generatedScript}
                                    </pre>
                                )}
                            </div>
                        </div>

                        {!state.protocol && (
                            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                <Radio className="w-12 h-12 text-white/5 animate-pulse" />
                                <p className="text-xs font-black text-white/20 uppercase tracking-widest leading-relaxed">Select a Protocol to Generate Script</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                    {t.warning}
                </p>
            </div>
        </div>
    );

    const renderToolbox = () => (
        <AnimatePresence>
            {showToolbox && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed top-24 right-4 md:right-12 bottom-32 w-[90%] md:w-[400px] bg-maritime-midnight/95 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h4 className="text-xl font-black text-maritime-brass uppercase italic">{t.toolboxTitle}</h4>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">{t.toolboxSub}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 mr-2">
                                <button
                                    onClick={() => setState(s => ({ ...s, language: 'en' }))}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${state.language === 'en' ? 'bg-maritime-ocean text-maritime-midnight shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setState(s => ({ ...s, language: 'es' }))}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${state.language === 'es' ? 'bg-maritime-ocean text-maritime-midnight shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >
                                    ES
                                </button>
                            </div>
                            <button onClick={() => setShowToolbox(false)} className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                        {/* NATO Alphabet */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-ocean uppercase tracking-widest border-l-2 border-maritime-ocean pl-4">{t.natoTitle}</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {NATO_ALPHABET.map(n => (
                                    <div key={n.l} className="p-3 bg-white/5 rounded-xl flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-maritime-ocean/20 text-maritime-ocean rounded flex items-center justify-center font-black">{n.l}</span>
                                            <span className="text-xs font-bold text-white">{n.c}</span>
                                        </div>
                                        <span className="text-[9px] text-white/30 font-mono italic">{n.p}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pro-Words */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-brass uppercase tracking-widest border-l-2 border-maritime-brass pl-4">{t.proWordsTitle}</h5>
                            <div className="space-y-2">
                                {PRO_WORDS.map(p => (
                                    <div key={p.w} className="p-4 bg-white/5 rounded-2xl space-y-1">
                                        <span className="block font-black text-maritime-brass text-xs">{p.w}</span>
                                        <p className="text-[10px] text-white/50 leading-relaxed">{p.d[state.language]}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Channel Guide */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-teal uppercase tracking-widest border-l-2 border-maritime-teal pl-4">{t.channelsTitle}</h5>
                            <div className="space-y-2">
                                {CHANNELS.map(c => (
                                    <div key={c.ch} className="p-4 bg-white/5 rounded-2xl flex items-center gap-4 border border-transparent hover:border-white/10 transition-all">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0" style={{ backgroundColor: `${c.color}22`, color: c.color }}>
                                            {c.ch}
                                        </div>
                                        <p className="text-[10px] text-white/70 font-medium leading-tight">{c.d[state.language]}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Silence Clock */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-ocean uppercase tracking-widest border-l-2 border-maritime-ocean pl-4">{t.silenceTitle}</h5>
                            <div className="bg-black/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 text-center">
                                <div className="relative w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center">
                                    {/* 0-3 min marker */}
                                    <div className="absolute top-0 left-1/2 -ml-[2px] w-[4px] h-4 bg-red-500 rounded-full origin-bottom" style={{ transform: 'rotate(0deg) translateY(-60px)' }}></div>
                                    {/* 30-33 min marker */}
                                    <div className="absolute top-0 left-1/2 -ml-[2px] w-[4px] h-4 bg-red-500 rounded-full origin-bottom" style={{ transform: 'rotate(180deg) translateY(-60px)' }}></div>
                                    <Clock className="w-12 h-12 text-white/10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-white uppercase italic">{t.silenceTitle}</p>
                                    <p className="text-[10px] text-white/40 leading-relaxed px-4">{t.silenceText}</p>
                                </div>
                            </div>
                        </section>

                        {/* Number Guide */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-brass uppercase tracking-widest border-l-2 border-maritime-brass pl-4">{t.numbersTitle}</h5>
                            <div className="grid grid-cols-4 gap-2">
                                {MARITIME_NUMBERS.map(m => (
                                    <div key={m.n} className="p-2 bg-white/5 rounded-xl text-center border border-transparent hover:border-white/10 transition-all">
                                        <span className="block text-xs font-black text-maritime-brass">{m.n}</span>
                                        <span className="text-[8px] font-bold text-white/40 uppercase">{m.p}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Radio Examples */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-brass uppercase tracking-widest border-l-2 border-maritime-brass pl-4">{t.examplesTitle}</h5>
                            <div className="space-y-4">
                                {EXAM_EXAMPLES.map((ex, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl space-y-3">
                                        <span className="block font-black text-maritime-brass text-xs uppercase tracking-tighter">{ex.title[state.language]}</span>
                                        <pre className="text-[9px] font-mono text-white/60 leading-relaxed bg-black/20 p-3 rounded-xl whitespace-pre-wrap">
                                            {ex.script[state.language]}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Routine Call Guide */}
                        <section className="space-y-4">
                            <h5 className="text-[11px] font-black text-maritime-ocean uppercase tracking-widest border-l-2 border-maritime-ocean pl-4">{t.routineGuideTitle}</h5>
                            <div className="space-y-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                                <p className="text-[10px] text-white/70 leading-relaxed"><span className="text-maritime-ocean font-bold">{t.routineGuideStep1}</span></p>
                                <p className="text-[10px] text-white/70 leading-relaxed">{t.routineGuideStep2}</p>
                                <p className="text-[10px] text-white/70 leading-relaxed">{t.routineGuideStep3}</p>
                                <p className="text-[10px] text-white/70 leading-relaxed">{t.routineGuideStep4}</p>
                                <p className="text-[10px] text-white/70 leading-relaxed">{t.routineGuideStep5}</p>
                                <div className="pt-2 mt-2 border-t border-white/5 flex items-start gap-2">
                                    <Check className="w-3 h-3 text-green-500 mt-0.5" />
                                    <p className="text-[9px] text-green-500/80 italic font-medium">{t.routineGuideTip}</p>
                                </div>
                            </div>
                        </section>

                        {/* Radio Check Tip */}
                        <div className="p-4 bg-maritime-ocean/10 border border-maritime-ocean/20 rounded-2xl flex items-start gap-3">
                            <Lightbulb className="w-4 h-4 text-maritime-ocean shrink-0 mt-0.5" />
                            <p className="text-[9px] text-maritime-ocean font-bold leading-relaxed">{t.radioCheckTip}</p>
                        </div>

                        {/* DSC Note */}
                        <div className="p-4 bg-maritime-brass/10 border border-maritime-brass/20 rounded-2xl flex items-start gap-3">
                            <Info className="w-4 h-4 text-maritime-brass shrink-0 mt-0.5" />
                            <p className="text-[9px] text-maritime-brass font-bold leading-relaxed">{t.dscWarn}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // --- Main Container ---

    return (
        <div className="max-w-4xl mx-auto relative group">
            {/* Steps Header */}
            {state.step > 0 && (
                <div className="flex justify-between items-center mb-10 px-6">
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${state.step >= s ? 'w-12 bg-maritime-ocean' : 'w-4 bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            )}

            <div className={`glass border border-white/10 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden transition-all duration-700 ${state.step === 0 ? 'bg-maritime-ocean/5' : ''}`}>
                {/* Beta Badge */}
                <div className="absolute top-8 left-10 flex items-center gap-2 px-3 py-1 bg-maritime-brass/10 border border-maritime-brass/20 rounded-full z-10">
                    <AlertTriangle className="w-3 h-3 text-maritime-brass" />
                    <span className="text-[8px] font-black uppercase text-maritime-brass tracking-[0.2em]">Beta Testing</span>
                </div>

                <AnimatePresence mode="wait">
                    {state.step === 0 && renderLanguageSelector()}
                    {state.step === 1 && renderOnboarding()}
                    {state.step === 2 && renderProtocolSelector()}
                    {state.step === 3 && renderScriptGenerator()}
                </AnimatePresence>

                {/* Footer Nav */}
                <div className={`mt-12 pt-10 border-t border-white/5 flex justify-between items-center ${state.step === 0 ? 'hidden' : ''}`}>
                    <button
                        onClick={prevStep}
                        className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-all group/back"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
                        {t.back}
                    </button>

                    <div className="hidden md:flex items-center gap-4 text-white/20">
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.phase} {state.step} {t.of} 3</span>
                    </div>

                    {state.step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="bg-maritime-ocean hover:bg-maritime-teal text-maritime-midnight px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl hover:shadow-maritime-ocean/20 group/next"
                        >
                            {t.continue}
                            <ChevronRight className="w-5 h-5 group-hover/next:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setState(s => ({ ...s, step: 0 }))}
                            className="bg-maritime-brass text-maritime-midnight px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all hover:scale-105"
                        >
                            {t.newSim}
                            <Radio className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-maritime-ocean/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-maritime-brass/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            </div>

            {renderToolbox()}
        </div>
    );
}
