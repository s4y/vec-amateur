var fs = require('fs');

var questionText = fs.readFileSync(process.argv[2], 'utf8');

var subelements = [], subelement, group, question, withdrawnQuestions = 0;
questionText.split('\n').forEach(function(line){
	var match;
	// console.error('LINE', line);
	if (question) {
		if (!question.question){
			// console.error('QUESTION DESCRIPTION', line);
			question.question = line;
		} else if ((match = line.match(/^[A-D]. (.+)\s*$/))){
			// console.error('QUESTION ANSWER', match[1]);
			question.answers.push(match[1]);
		} else if (/~~\s*/.test(line)) {
			// console.error('END QUESTION');
			question = null;
		} else if (question.answers.length) {
			question.answers[question.answers.length - 1] += ' ' + line;
		} else {
			question.question += ' ' + line;
		}
	} else if (/^\s*$/g.test(line)) {
	} else if ((match = line.match(/^(?:SUBELEMENT )?([A-Z]\d+) [-–—] ([^\]]+) \[(\d+) Exam Questions [-–—] (\d+) Groups\]\s*$/i))) {
		// console.error('SUBELEMENT', match[2]);
		subelements.push(subelement = {
			id: match[1],
			name: match[2],
			questionCount: parseInt(match[3], 10),
			groupCount: parseInt(match[4], 10),
			groups: []
		});
	} else if ((match = line.match(/^([A-Z]\d+[A-Z]+) (?:[-–—] )?(.+)\s*$/))) {
		// console.error('GROUP', match[2]);
		subelement.groups.push(group = {
			id: match[1],
			name: match[2],
			questions: []
		});
	} else if (/^[A-Z]\d+[A-Z]+\d+ *\([A-D]\) *Question withdrawn/i.test(line)) {
		// console.error('WITHDRAWN QUESTION');
		// /dev/null this question
		question = { answers: [] };
		withdrawnQuestions += 1;
	} else if ((match = line.match(/^([A-Z]\d+[A-Z]+\d+) *\(([A-D])\)(?: \[([^\]]+)\]?)?\s*$/))) {
		// console.error('START QUESTION');
		group.questions.push(question = {
			id: match[1],
			correctAnswer: { A: 0, B: 1, C: 2, D: 3 }[match[2]],
			reference: match[3],
			answers: []
		});
	} else {
		console.error('Unknown line:', line)
	}
});

var inputQuestionIds = questionText.match(/^[A-Z]\d+[A-Z]+\d+/gm),
	outputQuestionIds = subelements.reduce(function(acc, subelement){
	return acc.concat(subelement.groups.reduce(function(acc, group){
		return acc.concat(group.questions.map(function(q){
			return q.id; }));
		}, []));
	}, []);

console.error('Input appears to contain', inputQuestionIds.length.toString(), 'questions');
console.error('Found', outputQuestionIds.length.toString(),'questions' + (withdrawnQuestions ? ' plus ' + withdrawnQuestions + ' withdrawn' : ''));
if (inputQuestionIds.length - withdrawnQuestions === outputQuestionIds.length) {
	console.error('Great!');
} else {
	console.error("That's not good.");
	console.error("Their questions:");
	console.error(inputQuestionIds.join('\n'));
	console.error("\nOur questions:");
	console.error(outputQuestionIds.join('\n'));
}
subelements.forEach(function(subelement){
	if (subelement.groupCount != subelement.groups.length) {
		console.error('Wrong number of groups in subelement', subelement.id);
	}
	delete subelement.groupCount;
})

process.stdout.write(JSON.stringify(subelements, null, '\t'));
process.stdout.write('\n');