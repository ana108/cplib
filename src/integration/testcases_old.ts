export interface PostalCodesTestCase {
    src: string,
    dest: string
}

export interface RateCodeTestCase {
    postalCodes: PostalCodesTestCase,
    weights: any
}

export const allTestCases = {
    'A1': {
        postalCodes: { src: 'M9N0A1', dest: 'L9T0A1' },
        weights: {
            '0.75': 11.27,
            '1.0': 12.04,
            '1.5': 12.9,
            '2.0': 13.05,
            '2.5': 13.33
        }
    },
    'A2': {
        postalCodes: { src: 'M9P0A1', dest: 'L7K0A0' },
        weights: {
            '0.75': 11.4,
            '1.0': 12.33,
            '1.5': 13.25,
            '2.0': 13.58,
            '2.5': 14.17
        }
    },
    'A3': {
        postalCodes: { src: 'H7W0A2', dest: 'J3E0A2' },
        weights: {
            '0.75': 11.31,
            '1.0': 12.07,
            '1.5': 12.93,
            '2.0': 13.08,
            '2.5': 13.36
        }
    },
    'A4': {
        postalCodes: { src: 'V7Y1A1', dest: 'V1M0A1' },
        weights: {
            '0.75': 11.38,
            '1.0': 12.17,
            '1.5': 13.03,
            '2.0': 13.16,
            '2.5': 13.45
        }
    },
    'A5': {
        postalCodes: { src: 'K2B0A1', dest: 'J8L0A1' },
        weights: {
            '0.75': 12.11,
            '1.0': 12.72,
            '1.5': 13.33,
            '2.0': 13.59,
            '2.5': 14.29
        }
    },
    'A6': {
        postalCodes: { src: 'T9V0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 12.53,
            '1.0': 13.45,
            '1.5': 14.39,
            '2.0': 14.65,
            '2.5': 15.22
        }
    },
    'B1': {
        postalCodes: { src: 'K1Y0A1', dest: 'L6H0A1' },
        weights: {
            '0.75': 13.22,
            '1.0': 13.88,
            '1.5': 14.81,
            '2.0': 15.45,
            '2.5': 16.04
        }
    },
    'B2': {
        postalCodes: { src: 'J8X0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 13.18,
            '1.0': 13.87,
            '1.5': 14.79,
            '2.0': 15.42,
            '2.5': 16.01
        }
    },
    'B3': {
        postalCodes: { src: 'N2B0A2', dest: 'N3L0A1' },
        weights: {
            '0.75': 13.66,
            '1.0': 14.27,
            '1.5': 15.34,
            '2.0': 15.99,
            '2.5': 16.55
        }
    },
    'B4': {
        postalCodes: { src: 'N9C0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 13.59,
            '1.0': 14.23,
            '1.5': 15.29,
            '2.0': 15.91,
            '2.5': 16.49
        }
    },
    'B5': {
        postalCodes: { src: 'P6C0A1', dest: 'P8T0A1' },
        weights: {
            '0.75': 13.67,
            '1.0': 14.49,
            '1.5': 15.56,
            '2.0': 16.17,
            '2.5': 16.76
        }
    },
    'C1': {
        postalCodes: { src: 'S7W0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 13.68,
            '1.0': 14.35,
            '1.5': 15.34,
            '2.0': 15.96,
            '2.5': 16.53
        }
    },
    'C2': {
        postalCodes: { src: 'T6E0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 13.83,
            '1.0': 14.84,
            '1.5': 16.07,
            '2.0': 16.63,
            '2.5': 17.28
        }
    },
    'C3': {
        postalCodes: { src: 'B3T0A1', dest: 'B3Z0A1' },
        weights: {
            '0.75': 13.44,
            '1.0': 13.88,
            '1.5': 14.83,
            '2.0': 15.47,
            '2.5': 16.03
        }
    },
    'C4': {
        postalCodes: { src: 'J6E0A1', dest: 'A2V0A3' },
        weights: {
            '0.75': 13.92,
            '1.0': 14.65,
            '1.5': 15.7,
            '2.0': 16.35,
            '2.5': 16.92
        }
    },
    'C5': {
        postalCodes: { src: 'E2G0A1', dest: 'C0A0B0' },
        weights: {
            '0.75': 13.68,
            '1.0': 14.27,
            '1.5': 15.28,
            '2.0': 15.83,
            '2.5': 16.4
        }
    },
    'D1': {
        postalCodes: { src: 'R5A0A2', dest: 'P8T0A1' },
        weights: {
            '0.75': 15.21,
            '1.0': 16.69,
            '1.5': 17.75,
            '2.0': 18.51,
            '2.5': 19.48
        }
    },
    'D2': {
        postalCodes: { src: 'P0N1A6', dest: 'M4M1A1' },
        weights: {
            '0.75': 15.16,
            '1.0': 16.63,
            '1.5': 17.68,
            '2.0': 18.43,
            '2.5': 19.39
        }
    },
    'D3': {
        postalCodes: { src: 'P5A0A1', dest: 'P8T0A1' },
        weights: {
            '0.75': 16.0,
            '1.0': 17.54,
            '1.5': 18.67,
            '2.0': 19.46,
            '2.5': 20.41
        }
    },
    'D4': {
        postalCodes: { src: 'T8C0X5', dest: 'T0B0A8' },
        weights: {
            '0.75': 15.55,
            '1.0': 17.06,
            '1.5': 18.07,
            '2.0': 18.96,
            '2.5': 19.73
        }
    },
    'D5': {
        postalCodes: { src: 'V1E0A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 16.04,
            '1.0': 17.76,
            '1.5': 18.92,
            '2.0': 19.84,
            '2.5': 20.61
        }
    },
    'D6': {
        postalCodes: { src: 'E4E0A2', dest: 'C0A0B0' },
        weights: {
            '0.75': 15.5,
            '1.0': 17.13,
            '1.5': 18.22,
            '2.0': 19,
            '2.5': 19.95
        }
    },
    'D7': {
        postalCodes: { src: 'J9E1A0', dest: 'A2V0A3' },
        weights: {
            '0.75': 15.59,
            '1.0': 17.48,
            '1.5': 18.64,
            '2.0': 19.48,
            '2.5': 20.42
        }
    },
    'E1': {
        postalCodes: { src: 'P7G0A2', dest: 'S9V0A0' },
        weights: {
            '0.75': 15.5,
            '1.0': 17.09,
            '1.5': 18.17,
            '2.0': 19.06,
            '2.5': 19.92
        }
    },
    'E2': {
        postalCodes: { src: 'T8E1A1', dest: 'V1M0A1' },
        weights: {
            '0.75': 15.2,
            '1.0': 16.84,
            '1.5': 17.89,
            '2.0': 18.87,
            '2.5': 19.72
        }
    },
    'E3': {
        postalCodes: { src: 'S7N0A1', dest: 'M7A1A2' },
        weights: {
            '0.75': 15.26,
            '1.0': 16.91,
            '1.5': 17.98,
            '2.0': 18.97,
            '2.5': 19.81
        }
    },
    'E4': {
        postalCodes: { src: 'E1G0A1', dest: 'L3R0A1' },
        weights: {
            '0.75': 15.35,
            '1.0': 17,
            '1.5': 18.07,
            '2.0': 19.06,
            '2.5': 19.92
        }
    },
    'E5': {
        postalCodes: { src: 'V8W0A1', dest: 'T9V0A1' },
        weights: {
            '0.75': 15.41,
            '1.0': 17.09,
            '1.5': 18.16,
            '2.0': 19.14,
            '2.5': 20.01
        }
    },
    'F1': {
        postalCodes: { src: 'P9A0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 16.28,
            '1.0': 17.53,
            '1.5': 19.13,
            '2.0': 20.08,
            '2.5': 20.73
        }
    },
    'F2': {
        postalCodes: { src: 'V7N0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 16.43,
            '1.0': 17.68,
            '1.5': 19.32,
            '2.0': 20.27,
            '2.5': 20.93
        }
    },
    'F3': {
        postalCodes: { src: 'V9J1A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 18.29,
            '1.0': 21.31,
            '1.5': 22.14,
            '2.0': 23.17,
            '2.5': 24.49
        }
    },
    'F4': {
        postalCodes: { src: 'V8J0A3', dest: 'T0B0A8' },
        weights: {
            '0.75': 18.46,
            '1.0': 21.52,
            '1.5': 22.38,
            '2.0': 23.39,
            '2.5': 24.72
        }
    },
    'F5': {
        postalCodes: { src: 'V0X1A0', dest: 'T0J0A0' },
        weights: {
            '0.75': 18.81,
            '1.0': 21.96,
            '1.5': 22.81,
            '2.0': 23.86,
            '2.5': 25.23
        }
    },
    'F6': {
        postalCodes: { src: 'V1J0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 19.0,
            '1.0': 22.14,
            '1.5': 23.04,
            '2.0': 24.09,
            '2.5': 25.47
        }
    },
    'G1': {
        postalCodes: { src: 'X1A0A1', dest: 'S9V0A0' },
        weights: {
            '0.75': 17.6,
            '1.0': 18.88,
            '1.5': 20.55,
            '2.0': 21.63,
            '2.5': 22.28
        }
    },
    'G2': {
        postalCodes: { src: 'T6X0A1', dest: 'L6E0A1' },
        weights: {
            '0.75': 17.42,
            '1.0': 18.71,
            '1.5': 20.34,
            '2.0': 21.42,
            '2.5': 22.06
        }
    },
    'G3': {
        postalCodes: { src: 'V7X1A1', dest: 'M4R1A5' },
        weights: {
            '0.75': 17.46,
            '1.0': 18.74,
            '1.5': 20.4,
            '2.0': 21.48,
            '2.5': 22.11
        }
    },
    'G4': {
        postalCodes: { src: 'M2L1A0', dest: 'V3L0A2' },
        weights: {
            '0.75': 17.41,
            '1.0': 18.71,
            '1.5': 20.35,
            '2.0': 21.42,
            '2.5': 22.06
        }
    },
    'H1': {
        postalCodes: { src: 'Y1A0A2', dest: 'T0B0A8' },
        weights: {
            '0.75': 18.8,
            '1.0': 20.24,
            '1.5': 22.11,
            '2.0': 23.31,
            '2.5': 24.28
        }
    },
    'H2': {
        postalCodes: { src: 'V9L0A1', dest: 'M9R0A1' },
        weights: {
            '0.75': 18.61,
            '1.0': 20.06,
            '1.5': 21.9,
            '2.0': 23.07,
            '2.5': 24.04
        }
    },
    'H3': {
        postalCodes: { src: 'Y0B1A1', dest: 'T0B0A8' },
        weights: {
            '0.75': 21.11,
            '1.0': 23.79,
            '1.5': 26.12,
            '2.0': 27.4,
            '2.5': 28.73
        }
    },
    'H4': {
        postalCodes: { src: 'M9C1A1', dest: 'T0V0H0' },
        weights: {
            '0.75': 16.71,
            '1.0': 17.94,
            '1.5': 19.52,
            '2.0': 20.54,
            '2.5': 21.17
        }
    },
    'H5': {
        postalCodes: { src: 'X0E0A0', dest: 'T0B0A8' },
        weights: {
            '0.75': 21.15,
            '1.0': 23.68,
            '1.5': 26.07,
            '2.0': 28.02,
            '2.5': 29.37
        }
    },
    /*'J1': {
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
    },*/
};

export const americanTestCases = {
    'ALL': {
        region: { src: 'ON', dest: 'NY' },
        delivery_type: 'small_packet',
        weights: {
            '0.1': 8.3,
            '0.25': 10.17,
            '1.5': 22.9,
            '2.0': 25.71
        }
    },
    'RT1': {
        region: { src: 'ON', dest: 'NY' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 27.94
        }
    },
    'RT2': {
        region: { src: 'QC', dest: 'MA' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 28.47
        }
    },
    'RT3': {
        region: { src: 'AB', dest: 'UT' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 28.72
        }
    },
    'RT4': {
        region: { src: 'MB', dest: 'KS' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 29.19
        }
    },
    'RT5': {
        region: { src: 'YT', dest: 'ME' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 31.38
        }
    },
    'RT6': {
        region: { src: 'NU', dest: 'DC' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 31.03
        }
    },
    'RT7': {
        region: { src: 'BC', dest: 'AK' },
        delivery_type: 'expedited',
        weights: {
            '2.5': 31.38
        }
    },
}

export const internationalTestCases = {
    'SPS1': {
        country: { src: 'Canada', dest: 'Bermuda' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 9.9,
            '0.5': 13.86,
            '1.0': 22.93,
            '1.5': 28.3,
            '2.0': 33.67
        }
    },
    'SPS2': {
        country: { src: 'Canada', dest: 'Iceland' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 9.97,
            '0.5': 13.66,
            '1.0': 22.94,
            '1.5': 27.57,
            '2.0': 32.17
        }
    },
    'SPS3': {
        country: { src: 'Canada', dest: 'Belarus' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.53,
            '0.5': 15.92,
            '1.0': 25.9,
            '1.5': 32.05,
            '2.0': 38.16
        }
    },
    'SPA4': {
        country: { src: 'Canada', dest: 'Malaysia' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.25,
            '0.5': 14.4,
            '1.0': 24.03,
            '1.5': 29.7,
            '2.0': 35.34
        }
    },
    'SPS5': {
        country: { src: 'Canada', dest: 'Christmas Island' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.38,
            '0.5': 14.78,
            '1.0': 24.45,
            '1.5': 30.14,
            '2.0': 35.84
        }
    },
    'SPS6': {
        country: { src: 'Canada', dest: 'Vietnam' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.39,
            '0.5': 14.78,
            '1.0': 24.55,
            '1.5': 30.35,
            '2.0': 36.16
        }
    },
    'SPS7': {
        country: { src: 'Canada', dest: 'Guyana' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.45,
            '0.5': 15.15,
            '1.0': 25.38,
            '1.5': 31.68,
            '2.0': 37.98
        }
    },
    'SPS8': {
        country: { src: 'Canada', dest: 'Egypt' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.56,
            '0.5': 15.44,
            '1.0': 25.83,
            '1.5': 32.16,
            '2.0': 38.53
        }
    },
    'SPS9': {
        country: { src: 'Canada', dest: 'China' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.5,
            '0.5': 15.24,
            '1.0': 25.14,
            '1.5': 31.03,
            '2.0': 36.87
        }
    },
    'SPS10': {
        country: { src: 'Canada', dest: 'Armenia' },
        delivery_type: 'small_packet_surface',
        weights: {
            '0.25': 10.77,
            '0.5': 15.53,
            '1.0': 26.39,
            '1.5': 33.85,
            '2.0': 41.3
        }
    },
    '401': {
        country: { src: 'Canada', dest: 'Aruba' },
        delivery_type: 'surface',
        weights: {
            '2.5': 56.33
        }
    },
    '402': {
        country: { src: 'Canada', dest: 'IE' },
        delivery_type: 'surface',
        weights: {
            '2.5': 62.44
        }
    },
    '403': {
        country: { src: 'Canada', dest: 'Montenegro' },
        delivery_type: 'surface',
        weights: {
            '2.5': 72.72
        }
    },
    '404': {
        country: { src: 'Canada', dest: 'Japan' },
        delivery_type: 'surface',
        weights: {
            '2.5': 67.72
        }
    },
    '405': {
        country: { src: 'Canada', dest: 'NZ' },
        delivery_type: 'surface',
        weights: {
            '2.5': 69.55
        }
    },
    '406': {
        country: { src: 'Canada', dest: 'Cambodia' },
        delivery_type: 'surface',
        weights: {
            '2.5': 76.98
        }
    },
    '407': {
        country: { src: 'Canada', dest: 'Brazil' },
        delivery_type: 'surface',
        weights: {
            '2.5': 72.82
        }
    },
    '408': {
        country: { src: 'Canada', dest: 'Bahrain' },
        delivery_type: 'surface',
        weights: {
            '2.5': 79.46
        }
    },
    '409': {
        country: { src: 'Canada', dest: 'China' },
        delivery_type: 'surface',
        weights: {
            '2.5': 74.05
        }
    },
    '410': {
        country: { src: 'Canada', dest: 'MG' },
        delivery_type: 'surface',
        weights: {
            '2.5': 75.13
        }
    },
}