import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { olorunsogoStore } from '@/stores/olorunsogoStore';
import { olorunsogoNippStore } from '@/stores/olorunsogoNippStore';
import { stationStore } from '@/helper';

describe('Olorunsogo Realtime Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    const samplePayload = {
        id: "olorunsogoGas",
        t: "2026-10-26T12:30:18.000Z",
        units: [
            { id: "gt1", pd: { mw: "25.0", a: "120", v: "15.7", mx: "5.0", pf: "0.98", f: "50.0" } },
            { id: "gt2", pd: { mw: "26.0", a: "122", v: "15.7", mx: "5.2", pf: "0.98", f: "50.0" } },
            { id: "gt3", pd: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } },
            { id: "gt4", pd: { mw: "24.5", a: "118", v: "15.7", mx: "4.8", pf: "0.98", f: "50.0" } },
            { id: "gt5", pd: { mw: "28.0", a: "130", v: "15.8", mx: "6.0", pf: "0.97", f: "50.0" } },
            { id: "gt6", pd: { mw: "27.5", a: "128", v: "15.8", mx: "5.8", pf: "0.97", f: "50.0" } },
            { id: "gt7", pd: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } },
            { id: "gt8", pd: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } }
        ],
        sections: [
            { id: "gt1", data: { mw: "25.0", a: "120", v: "15.7", mx: "5.0", pf: "0.98", f: "50.0" } },
            { id: "gt2", data: { mw: "26.0", a: "122", v: "15.7", mx: "5.2", pf: "0.98", f: "50.0" } },
            { id: "gt3", data: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } },
            { id: "gt4", data: { mw: "24.5", a: "118", v: "15.7", mx: "4.8", pf: "0.98", f: "50.0" } },
            { id: "gt5", data: { mw: "28.0", a: "130", v: "15.8", mx: "6.0", pf: "0.97", f: "50.0" } },
            { id: "gt6", data: { mw: "27.5", a: "128", v: "15.8", mx: "5.8", pf: "0.97", f: "50.0" } },
            { id: "gt7", data: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } },
            { id: "gt8", data: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } }
        ]
    };

    it('resolves olorunsogoGas store via stationStore helper', () => {
        const store = stationStore('olorunsogoGas');
        expect(store).toBeDefined();
        expect(store.$id).toBe('olorunsogoGas');
    });

    it('correctly ingests and aggregates payload data', () => {
        const store = olorunsogoStore();
        store.set(samplePayload);

        expect(store.isConnected).toBe(true);
        expect(store.isConnectionLost).toBe(false);
        expect(store.station.sections.length).toBe(8);

        // 25.0 + 26.0 + 0 + 24.5 + 28.0 + 27.5 + 0 + 0 = 131.00 MW
        expect(store.vals.mw).toBe('131.00');

        // 5.0 + 5.2 + 0 + 4.8 + 6.0 + 5.8 + 0 + 0 = 26.80 MVar
        expect(store.vals.mx).toBe('26.80');

        // peak voltage = 15.8 -> integer 15
        expect(store.vals.kv).toBe(15);

        // timestamp
        expect(store.vals.t).toBe("2026-10-26T12:30:18.000Z");
    });

    it('normalizes units array when sections is not provided', () => {
        const store = olorunsogoStore();
        const unitsOnlyPayload = {
            id: "olorunsogoGas",
            t: "2026-10-26T12:30:18.000Z",
            units: samplePayload.units
        };
        store.set(unitsOnlyPayload);

        expect(store.station.sections.length).toBe(8);
        expect(store.vals.mw).toBe('131.00');
        expect(store.vals.mx).toBe('26.80');
    });

    it('provides compatible mergedVals for olorunsogoNippStore', () => {
        const gasStore = olorunsogoStore();
        gasStore.set(samplePayload);

        const nippStore = olorunsogoNippStore();
        // Set sample transmission line values to test subtraction
        nippStore.set({
            id: 'olorunsogoLines',
            t: "2026-10-26T12:30:18.000Z",
            sections: [
                { id: 'line1', data: { mw: '200.00', mx: '40.00', v: '330' } }
            ]
        });

        // NIPP calculation: 200.00 - 131.00 = 69.00
        expect(nippStore.vals.mw).toBe('69.00');
        // NIPP reactive: 40.00 - 26.80 = 13.20
        expect(nippStore.vals.mx).toBe('13.20');
    });
});
