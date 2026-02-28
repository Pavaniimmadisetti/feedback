const QUESTION_KEYS = Array.from({ length: 35 }, (_, i) => `q${i + 1}`);

function ratingQuestion(index, label, options) {
  return {
    key: `q${index}`,
    index,
    type: 'rating',
    label,
    options: options.map((text, idx) => ({
      value: String(idx + 1),
      text
    }))
  };
}

function textQuestion(index, label, maxLength = 100) {
  return {
    key: `q${index}`,
    index,
    type: 'text',
    label,
    maxLength
  };
}

const fivePointStandard = ['Excellent', 'Very good', 'Good', 'Fair', 'Poor'];
const fivePointAgreement = ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];

const FACULTY_QUESTIONS = [
  ratingQuestion(1, 'Punctuality to the class', [
    'Highly Punctual',
    'Mostly Punctual',
    'Sometimes Punctual',
    'Few times Punctual',
    'Rarely Punctual'
  ]),
  ratingQuestion(2, 'Provided course plan', [
    'At the beginning of the semester',
    'One week after commencement',
    'Two weeks after commencement',
    'In the middle of the semester',
    'Never given'
  ]),
  ratingQuestion(3, "Instructor's knowledge in the subject", [
    'Very High',
    'High',
    'Average',
    'Low',
    'Very Low'
  ]),
  ratingQuestion(4, 'Planning the sequence of course delivery', [
    'Excellent',
    'Very good',
    'Good',
    'Not Good',
    'Not at all good'
  ]),
  ratingQuestion(5, 'Time given to teach each topic', [
    'Appropriate time to each topic',
    'Given equal time to each topic',
    'Some chapters are not given enough time',
    'More time to beginning chapters and less time to end chapters',
    'No proper planning of time'
  ]),
  ratingQuestion(6, 'Explanation of the concepts', fivePointStandard),
  ratingQuestion(7, 'Dictates notes in the class', ['Always', 'Mostly', 'Sometimes', 'Few times', 'Rarely']),
  ratingQuestion(8, 'Faculty attends to individual student needs', ['Always', 'Mostly', 'Sometimes', 'Few times', 'Rarely']),
  ratingQuestion(9, 'Fairness in grading of answers in Exams/Quizzes/Assignments/Projects', [
    'Very High',
    'High',
    'Moderate',
    'Less',
    'Not Fair'
  ]),
  ratingQuestion(10, 'Gives feedback on Exams / Quizzes / Assignments / Projects', [
    'Always both orally in the class and on answer script',
    'Sometimes orally in the class and always on answer script',
    'Sometimes orally in the class and sometimes on answer script',
    'Never orally in the class and sometimes on answer script',
    'Never, both orally in the class or on answer script'
  ]),
  ratingQuestion(11, 'Faculty encourages students to ask questions/doubts and to be active in class', ['Always', 'Mostly', 'Sometimes', 'Few times', 'Rarely']),
  ratingQuestion(12, 'Faculty member uses Telugu in the classroom', [
    'Always both for teaching subject and general talk',
    'Always for general talk only',
    'Intermittently for teaching and always for general talk',
    'Sometimes for teaching and general talk',
    'Never speaks in Telugu'
  ]),
  ratingQuestion(13, 'Maintaining discipline in the class by faculty member', fivePointStandard),
  ratingQuestion(14, 'Behaviour with the students', fivePointStandard),
  ratingQuestion(15, 'Encourages and motivates students towards regular studies', ['Always', 'Mostly', 'Sometimes', 'Few times', 'Rarely']),
  ratingQuestion(16, 'Coverage of course syllabus', [
    'Completely covered',
    'Mostly covered',
    'Few chapters are left',
    'Half only covered',
    'Poorly covered'
  ]),
  ratingQuestion(17, 'Effectiveness of usage of Chalk/White Board and/or PPT', fivePointStandard),
  ratingQuestion(18, 'Meeting the faculty member after class hours or in leisure time', [
    'Always available',
    'Available sometimes',
    'Available on few times',
    'Do not encourage to meet',
    'Not available'
  ]),
  textQuestion(33, 'Strengths'),
  textQuestion(34, 'Weaknesses'),
  textQuestion(35, 'Suggestions')
];

const COURSE_QUESTIONS = [
  ratingQuestion(1, 'This course is completely related to the Program', fivePointAgreement),
  ratingQuestion(2, 'Course importance for program and employment', fivePointAgreement),
  ratingQuestion(3, 'Course contents are up-to-date and adequate', fivePointAgreement),
  ratingQuestion(4, 'Course objectives are contemporary and enhance skills', fivePointAgreement),
  ratingQuestion(5, 'Course Input learning outcomes are understandable and completely achievable', fivePointAgreement),
  ratingQuestion(6, 'Course Input learning outcomes are completely related to the course objectives', fivePointAgreement),
  ratingQuestion(7, 'Teaching methods used in the course are highly useful to gain mastery in the subject', fivePointAgreement),
  ratingQuestion(8, 'Assessment methods prescribed by course outline are highly appropriate to its contents', fivePointAgreement),
  ratingQuestion(9, "Exams' & quizzes' questions are clear and completely related to course contents", fivePointAgreement),
  ratingQuestion(10, 'Text book used is highly suitable and current edition', fivePointAgreement),
  textQuestion(33, 'Strengths'),
  textQuestion(34, 'Weaknesses'),
  textQuestion(35, 'Suggestions')
];

function getQuestionsByFeedbackFor(feedbackFor) {
  return feedbackFor === 'course' ? COURSE_QUESTIONS : FACULTY_QUESTIONS;
}

function validateFeedbackPayload(payload, feedbackFor = 'faculty') {
  const questions = getQuestionsByFeedbackFor(feedbackFor);
  const errors = [];

  for (const question of questions) {
    const value = payload[question.key];
    if (value === undefined || value === null || value === '') {
      errors.push(`${question.key} is required`);
      continue;
    }

    if (question.type === 'rating') {
      const numeric = Number(value);
      const max = Array.isArray(question.options) && question.options.length ? question.options.length : 5;
      if (!Number.isInteger(numeric) || numeric < 1 || numeric > max) {
        errors.push(`${question.key} must be an integer from 1 to ${max}`);
      }
    } else {
      const text = String(value).trim();
      if (text.length > question.maxLength) {
        errors.push(`${question.key} must be at most ${question.maxLength} characters`);
      }
    }
  }

  return errors;
}

function buildStoredAnswerMap(payload, feedbackFor = 'faculty') {
  const answeredKeys = new Set(getQuestionsByFeedbackFor(feedbackFor).map((question) => question.key));
  const map = {};
  for (let i = 1; i <= 35; i += 1) {
    const key = `q${i}`;
    if (answeredKeys.has(key)) {
      const question = getQuestionsByFeedbackFor(feedbackFor).find((item) => item.key === key);
      if (question.type === 'rating') {
        map[key] = Number(payload[key]);
      } else {
        map[key] = String(payload[key] || '').trim();
      }
      continue;
    }

    if (i >= 33) {
      map[key] = '';
    } else {
      map[key] = 3;
    }
  }
  return map;
}

module.exports = {
  QUESTION_KEYS,
  FACULTY_QUESTIONS,
  COURSE_QUESTIONS,
  getQuestionsByFeedbackFor,
  validateFeedbackPayload,
  buildStoredAnswerMap
};
