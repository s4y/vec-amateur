var fs = require('fs');

var questionText = fs.readFileSync(process.argv[2], 'utf8');

var subelements = [], subelement, group, question;
questionText.split('\n').forEach(function(line){
	var match;
	console.error('LINE', line);
	if (question) {
		if (!question.question){
			console.error('QUESTION DESCRIPTION', line);
			question.question = line;
		} else if ((match = line.match(/^[A-D]. (.+)\s*$/))){
			console.error('QUESTION ANSWER', match[1]);
			question.answers.push(match[1]);
		} else if (/~~\s*/.test(line)) {
			console.error('END QUESTION');
			question = null;
		}
	} else if (/^\s*$/g.test(line)) {
	} else if ((match = line.match(/^(?:SUBELEMENT )?([A-Z]\d+) [-–—] ([^\]]+) \[(\d+) Exam Questions [-–—] (\d+) Groups\]\s*$/i))) {
		console.error('SUBELEMENT', match[2]);
		subelements.push(subelement = {
			id: match[1],
			name: match[2],
			questionCount: parseInt(match[3], 10),
			groupCount: parseInt(match[4], 10),
			groups: []
		});
	} else if ((match = line.match(/^([A-Z]\d+[A-Z]+) (?:[-–—] )?(.+)\s*$/))) {
		console.error('GROUP', match[2]);
		subelement.groups.push(group = {
			id: match[1],
			name: match[2],
			questions: []
		});
	} else if (/^[A-Z]\d+[A-Z]+\d+ *\([A-D]\) *Question withdrawn/i.test(line)) {
		console.error('WITHDRAWN QUESTION');
		// /dev/null this question
		question = { answers: [] };
	} else if ((match = line.match(/^([A-Z]\d+[A-Z]+\d+) *\(([A-D])\)(?: \[([^\]]+)\]?)?\s*$/))) {
		console.error('START QUESTION');
		group.questions.push(question = {
			id: match[1],
			correctAnswer: { A: 0, B: 1, C: 2, D: 3 }[match[2]],
			reference: match[3],
			answers: []
		});
	} else {
		console.error('UNKNOWN LINE', line)
	}
});
process.stdout.write(JSON.stringify(subelements, null, '\t'));
process.stdout.write('\n');