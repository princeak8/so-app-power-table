import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { kashimbilaStore } from '@/stores/kashimbilaStore';
import { stationStore } from '@/helper';

describe('Kashimbila Realtime Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    const samplePayload = {
        id: "kashimbila",
        t: "2026-10-28T10:24:00.000Z",
        units: [
            { id: "unit1", pd: { mw: "10.0", a: "500", v: "11.5", mx: "2.1", pf: "0.98", f: "50.0" } },
            { id: "unit2", pd: { mw: "9.8",  a: "490", v: "11.5", mx: "2.0", pf: "0.98", f: "50.0" } },
            { id: "unit3", pd: { mw: "0.0",  a: "0",   v: "0",    mx: "0",   pf: "0",    f: "0" } },
            { id: "unit4", pd: { mw: "10.2", a: "510", v: "11.5", mx: "2.2", pf: "0.98", f: "50.0" } }
        ],
        sections: [
            {
                id: "unit1",
                pd: { mw: "10.0", a: "500", v: "11.5", mx: "2.1", pf: "0.98", f: "50.0" },
                data: { mw: "10.0", a: "500", v: "11.5", mx: "2.1", pf: "0.98", f: "50.0" }
            },
            {
                id: "unit2",
                pd: { mw: "9.8", a: "490", v: "11.5", mx: "2.0", pf: "0.98", f: "50.0" },
                data: { mw: "9.8", a: "490", v: "11.5", mx: "2.0", pf: "0.98", f: "50.0" }
            },
            {
                id: "unit3",
                pd: { mw: "0.0", a: "0", v: "0", mx: "0", pf: "0", f: "0" },
                data: { mw: "0.0", a: "0", v: "0", mx: "0", pf: "0", f: "0" }
            },
            {
                id: "unit4",
                pd: { mw: "10.2", a: "510", v: "11.5", mx: "2.2", pf: "0.98", f: "50.0" },
                data: { mw: "10.2", a: "510", v: "11.5", mx: "2.2", pf: "0.98", f: "50.0" }
            }
        ]
    };

    it('resolves kashimbila store via stationStore helper', () => {
        const store = stationStore('kashimbila');
        expect(store).toBeDefined();
        expect(store.$id).toBe('kashimbila');
    });

    it('correctly ingests and aggregates payload data', () => {
        const store = kashimbilaStore();
        store.set(samplePayload);

        expect(store.isConnected).toBe(true);
        expect(store.isConnectionLost).toBe(false);
        expect(store.station.sections.length).toBe(4);

        // 10.0 + 9.8 + 0.0 + 10.2 = 30.00 MW
        expect(store.vals.mw).toBe('30.00');

        // 2.1 + 2.0 + 0.0 + 2.2 = 6.30 MVar
        expect(store.vals.mx).toBe('6.30');

        // peak voltage 11.5 kV -> parsed as integer 11
        expect(store.vals.kv).toBe(11);

        // timestamp
        expect(store.vals.t).toBe("2026-10-28T10:24:00.000Z");
    });

    it('normalizes units array when sections is not provided', () => {
        const store = kashimbilaStore();
        const unitsOnlyPayload = {
            id: "kashimbila",
            t: "2026-10-28T10:24:00.000Z",
            units: samplePayload.units
        };
        store.set(unitsOnlyPayload);

        expect(store.station.sections.length).toBe(4);
        expect(store.vals.mw).toBe('30.00');
        expect(store.vals.mx).toBe('6.30');
    });
});
