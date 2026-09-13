import * as Astronomy from 'astronomy-engine';
const t = Astronomy.MakeTime(new Date('1994-08-13T01:40:00Z'));
const v = Astronomy.GeoVector(Astronomy.Body.Venus, t, true);
const e = Astronomy.Ecliptic(v);
export const x: number = e.elon;
