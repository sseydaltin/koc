// Leitner SRS box schedule (hours)
const BOX_SCHEDULE = { 1: 4, 2: 24, 3: 72, 4: 168, 5: 720 }

export function getNextReview(box) {
  const hours = BOX_SCHEDULE[box] ?? 4
  return new Date(Date.now() + hours * 3600 * 1000)
}

export function processAnswer(currentBox, isCorrect) {
  if (isCorrect) {
    const nextBox = Math.min(currentBox + 1, 5)
    return { box: nextBox, next_review: getNextReview(nextBox) }
  }
  return { box: 1, next_review: getNextReview(1) }
}

export function isDueForReview(nextReview) {
  if (!nextReview) return true
  const reviewDate = nextReview.toDate ? nextReview.toDate() : new Date(nextReview)
  return reviewDate <= new Date()
}
