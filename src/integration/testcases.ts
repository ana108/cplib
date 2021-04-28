export interface PostalCodesTestCase {
    src: string,
    dest: string
}

export interface RateCodeTestCase {
    postalCodes: PostalCodesTestCase,
    weights: any
}
/*
L0H1A0|L4G0A1|A1
*/
export const allTestCases = {
    'A1': {
        postalCodes: { src: 'M9N0A1', dest: 'L9T0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'A2': {
        postalCodes: { src: 'M9P0A1', dest: 'L7K0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'A3': {
        postalCodes: { src: 'H7W0A2', dest: 'J3E0A2' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'A4': {
        postalCodes: { src: 'V7Y1A1', dest: 'V1M0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'A5': {
        postalCodes: { src: 'K2B0A1', dest: 'J8L0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'A6': {
        postalCodes: { src: 'T9V0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'B1': {
        postalCodes: { src: 'K1Y0A1', dest: 'L6H0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'B2': {
        postalCodes: { src: 'J8X0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'B3': {
        postalCodes: { src: 'N2B0A2', dest: 'N3L0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'B4': {
        postalCodes: { src: 'N9C0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'B5': {
        postalCodes: { src: 'P6C0A1', dest: 'P8T0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'C1': {
        postalCodes: { src: 'S7W0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'C2': {
        postalCodes: { src: 'T6E0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'C3': {
        postalCodes: { src: 'B3T0A1', dest: 'B3Z0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'C4': {
        postalCodes: { src: 'J6E0A1', dest: 'A2V0A3' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'C5': {
        postalCodes: { src: 'E2G0A1', dest: 'C0A0B0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D1': {
        postalCodes: { src: 'R5A0A2', dest: 'P8T0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D2': {
        postalCodes: { src: 'P0N1A6', dest: 'M4M1A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D3': {
        postalCodes: { src: 'P5A0A1', dest: 'P8T0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D4': {
        postalCodes: { src: 'T8C0X5', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D5': {
        postalCodes: { src: 'V1E0A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D6': {
        postalCodes: { src: 'E4E0A2', dest: 'C0A0B0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'D7': {
        postalCodes: { src: 'J9E1A0', dest: 'A2V0A3' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'E1': {
        postalCodes: { src: 'P7G0A2', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'E2': {
        postalCodes: { src: 'T8E1A1', dest: 'V1M0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'E3': {
        postalCodes: { src: 'S7N0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'E4': {
        postalCodes: { src: 'E1G0A1', dest: 'L3R0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'E5': {
        postalCodes: { src: 'V8W0A1', dest: 'T9V0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F1': {
        postalCodes: { src: 'P9A0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F2': {
        postalCodes: { src: 'V7N0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F3': {
        postalCodes: { src: 'V9J1A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F4': {
        postalCodes: { src: 'V8J0A3', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F5': {
        postalCodes: { src: 'V0X1A0', dest: 'T0J0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'F6': {
        postalCodes: { src: 'V1J0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'G1': {
        postalCodes: { src: 'X1A0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'G2': {
        postalCodes: { src: 'T6X0A1', dest: 'L6E0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'G3': {
        postalCodes: { src: 'V7X1A1', dest: 'M4R1A5' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'G4': {
        postalCodes: { src: 'M2L1A0', dest: 'V3L0A2' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'H1': {
        postalCodes: { src: 'Y1A0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'H2': {
        postalCodes: { src: 'V9L0A1', dest: 'M9R0A1' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'H3': {
        postalCodes: { src: 'Y0B1A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'H4': {
        postalCodes: { src: 'M9C1A1', dest: 'T0V0H0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'H5': {
        postalCodes: { src: 'X0E0A0', dest: 'T0B0A8' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'J1': {
        postalCodes: { src: 'T0P1E0', dest: 'T0B0H0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
    'J2': {
        postalCodes: { src: 'Y0B1H0', dest: 'Y0B1H0' },
        weights: {
            '0.75': 10.0,
            '1.0': 10.0,
            '1.5': 10.0,
            '2.0': 10.0,
            '2.5': 10.0
        }
    },
};