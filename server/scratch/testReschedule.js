// Standalone Dry-Run Test for Auto-Rescheduling Algorithm
console.log("=== STARTING DRY-RUN RESCHEDULING ALGORITHM TEST ===");

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Mock Doctor Profile Availability
const doctorProfile = {
  name: "Dr. Alice Smith",
  availability: [
    { day: 'Mon', slots: ['10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM'] },
    { day: 'Wed', slots: ['02:00 PM - 03:00 PM'] },
    { day: 'Fri', slots: ['09:00 AM - 10:00 AM'] }
  ]
};

// Test Case 1: Appointment missed on Saturday
// Tomorrow is Sunday (should skip), so it must reschedule to Monday!
const missedDateSaturday = new Date('2026-05-23T10:00:00'); // Saturday
console.log(`\nTest Case 1: Missed Appointment on: Saturday (${missedDateSaturday.toDateString()})`);

let rescheduled1 = false;
for (let offset = 1; offset <= 6; offset++) {
  const checkDate = new Date(missedDateSaturday);
  checkDate.setDate(missedDateSaturday.getDate() + offset);

  // Skip Sunday
  if (checkDate.getDay() === 0) {
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (Sunday - SKIPPING)`);
    continue;
  }

  const checkDayName = dayNames[checkDate.getDay()];
  const slotForDay = doctorProfile.availability.find(a => a.day === checkDayName);

  if (slotForDay && slotForDay.slots && slotForDay.slots.length > 0) {
    const chosenSlot = slotForDay.slots[0];
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (${checkDayName}) -> FOUND SLOT: "${chosenSlot}"`);
    console.log(`  >>> SUCCESSFULLY RESCHEDULED to ${checkDate.toDateString()} (${chosenSlot})`);
    rescheduled1 = true;
    break;
  } else {
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (${checkDayName}) -> No doctor slots configured.`);
  }
}

if (!rescheduled1) {
  console.log("  >>> FAILED TO RESCHEDULE (Cancelled)");
}

// Test Case 2: Appointment missed on Monday
// Tomorrow is Tuesday (no slots configured), Wednesday is available! Should schedule to Wednesday.
const missedDateMonday = new Date('2026-05-25T10:00:00'); // Monday
console.log(`\nTest Case 2: Missed Appointment on: Monday (${missedDateMonday.toDateString()})`);

let rescheduled2 = false;
for (let offset = 1; offset <= 6; offset++) {
  const checkDate = new Date(missedDateMonday);
  checkDate.setDate(missedDateMonday.getDate() + offset);

  // Skip Sunday
  if (checkDate.getDay() === 0) {
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (Sunday - SKIPPING)`);
    continue;
  }

  const checkDayName = dayNames[checkDate.getDay()];
  const slotForDay = doctorProfile.availability.find(a => a.day === checkDayName);

  if (slotForDay && slotForDay.slots && slotForDay.slots.length > 0) {
    const chosenSlot = slotForDay.slots[0];
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (${checkDayName}) -> FOUND SLOT: "${chosenSlot}"`);
    console.log(`  >>> SUCCESSFULLY RESCHEDULED to ${checkDate.toDateString()} (${chosenSlot})`);
    rescheduled2 = true;
    break;
  } else {
    console.log(`  Checking Day +${offset}: ${checkDate.toDateString()} (${checkDayName}) -> No doctor slots configured.`);
  }
}

if (!rescheduled2) {
  console.log("  >>> FAILED TO RESCHEDULE (Cancelled)");
}

console.log("\n=== DRY-RUN RESCHEDULING ALGORITHM TEST COMPLETE ===");
