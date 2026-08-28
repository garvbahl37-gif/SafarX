import { callIrctc, failTrains, JOURNEY_HOST } from "./_irctc.js";

/**
 * Ticket status for a PNR.
 *
 * The response carries passenger details, so nothing here is cached, logged or
 * stored — it is read from IRCTC, passed to the traveller who asked, and
 * forgotten.
 */
export default async function handler(req, res) {
  const pnr = String(req.query.pnr || "").replace(/\s/g, "");
  if (!/^\d{10}$/.test(pnr)) {
    return res.status(400).json({ error: "A PNR is ten digits." });
  }

  try {
    const body = await callIrctc(JOURNEY_HOST, `api/v1/pnr-status?pnrNo=${pnr}`);
    const d = body.data || body;

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      data: {
        pnr,
        trainNumber: d.trainNumber ?? d.trainNo ?? null,
        trainName: d.trainName ?? null,
        journeyDate: d.dateOfJourney ?? d.journeyDate ?? null,
        from: d.sourceStation ?? d.boardingPoint ?? null,
        to: d.destinationStation ?? d.reservationUpto ?? null,
        travelClass: d.journeyClass ?? d.class ?? null,
        chartPrepared: d.chartPrepared ?? null,
        passengers: (d.passengerList || d.passengers || []).map((p, i) => ({
          number: p.passengerSerialNumber ?? i + 1,
          booking: p.bookingStatus ?? p.bookingStatusDetails ?? null,
          current: p.currentStatus ?? p.currentStatusDetails ?? null,
          coach: p.currentCoachId ?? p.coach ?? null,
          berth: p.currentBerthNo ?? p.berth ?? null,
        })),
      },
    });
  } catch (err) {
    return failTrains(res, err);
  }
}
