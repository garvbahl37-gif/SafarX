export const calculateItineraryDetails = (formData) => {
  const {
    sourceState,
    state, // destination
    selectedSites,
    month,
    days,
    transport,
    accommodation,
    temperature,  // from averageMonthlyTemperature
  } = formData;

  const totalDuration = parseInt(days);

  // Dynamically allocate days: never more than user selected
  const schedule = [];
  let day = 1;
  let dayUsed = 0;

  // Plan sites, fitting inside duration
  let sitesToUse = [];
  let daysLeft = totalDuration;
  for (const site of selectedSites) {
    let toAssign = Math.min(site.duration, daysLeft);
    for (let i = 0; i < toAssign; i++) {
      sitesToUse.push({ ...site });
      daysLeft--;
      if (daysLeft === 0) break;
    }
    if (daysLeft === 0) break;
  }

  // Assign schedule: always fill totalDuration
  let siteIdx = 0;
  for (let d = 1; d <= totalDuration; d++) {
    if (siteIdx < sitesToUse.length) {
      const s = sitesToUse[siteIdx];
      schedule.push({
        day: d,
        activity: `Visit ${s.name} at ${s.city}`,
        description: s.description,
        type: 'site',
        cost: s.avgCostPerDay,
      });
      siteIdx++;
    } else if (d === 1) {
      schedule.push({
        day: d,
        activity: `Travel from ${sourceState} to ${state}`,
        type: 'travel',
        cost: 800,
      });
    } else {
      schedule.push({
        day: d,
        activity: 'Leisure/local exploration',
        type: 'leisure',
        cost: 300,
      });
    }
  }

  // Cost calculation (strictly for the assigned days)
  const accommodationCost = totalDuration * accommodation.costPerNight;
  const siteCost = sitesToUse.reduce((sum, s) => sum + s.avgCostPerDay, 0);

  // Estimate transport: use source <> destination; if same, minimal
  const estimatedDistance = (sourceState === state ? 100 : 800) + selectedSites.length * 80;
  const transportCost = Math.round(estimatedDistance * transport.costPerKm);

  const mealsCost = totalDuration * 500;
  const miscCost = totalDuration * 300;

  const totalCost =
    accommodationCost + siteCost + transportCost + mealsCost + miscCost;

  return {
    totalCost,
    breakdown: {
      accommodation: accommodationCost,
      sites: siteCost,
      transport: transportCost,
      meals: mealsCost,
      miscellaneous: miscCost,
    },
    totalDuration,
    schedule,
    estimatedDistance,
    recommendations: generateRecommendations(month, transport, state, temperature),
    temperature,
  };
};

const generateRecommendations = (month, transport, state, temperature) => {
  const recommendations = [];

  if (month.crowd === 'High') {
    recommendations.push('Book accommodations and tickets in advance as this is peak season');
  } else if (month.crowd === 'Low') {
    recommendations.push('Good time to visit with fewer crowds and discounts available');
  }

  if (transport.name === 'Flight') {
    recommendations.push('Book flights at least 2-3 weeks in advance for better prices');
  } else if (transport.name === 'Train') {
    recommendations.push('Book train tickets early for better availability');
  }

  recommendations.push('Carry travel insurance for unexpected emergencies');
  if (temperature) {
    recommendations.push(
      `Average temperature in ${state} in ${month.name}: ${temperature}°C`
    );
  }

  return recommendations;
};
