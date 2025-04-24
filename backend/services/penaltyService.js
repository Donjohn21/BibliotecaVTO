const moment = require('moment');

// Configuración de multas
const PENALTY_RATE_PER_DAY = 1.0; // $1 por día de retraso
const MAX_PENALTY_DAYS = 30; // Máximo 30 días de multa
const PENALTY_THRESHOLD = 3; // Después de 3 multas, suspender cuenta

exports.calculatePenalty = (dueDate, returnDate) => {
  const dueMoment = moment(dueDate);
  const returnMoment = moment(returnDate);
  
  if (returnMoment.isSameOrBefore(dueMoment)) {
    return 0;
  }

  const daysLate = returnMoment.diff(dueMoment, 'days');
  const penaltyDays = Math.min(daysLate, MAX_PENALTY_DAYS);
  return penaltyDays * PENALTY_RATE_PER_DAY;
};

exports.checkUserPenaltyStatus = async (user) => {
  if (user.penaltyCount >= PENALTY_THRESHOLD) {
    const lastPenaltyDate = moment(user.lastPenaltyDate);
    const penaltyDuration = 7; // 7 días de penalización
    const penaltyEndDate = lastPenaltyDate.add(penaltyDuration, 'days');

    if (moment().isBefore(penaltyEndDate)) {
      return {
        isUnderPenalty: true,
        penaltyEndDate: penaltyEndDate.toDate(),
        message: `User is under penalty until ${penaltyEndDate.format('YYYY-MM-DD')}`
      };
    } else {
      // Reset penalty count if penalty period has passed
      await user.update({ penaltyCount: 0 });
      return { isUnderPenalty: false };
    }
  }
  return { isUnderPenalty: false };
};