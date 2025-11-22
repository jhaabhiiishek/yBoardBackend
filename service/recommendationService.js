export const analyzeCard = (card, allBoardCards) => {
    const suggestions = [];

    const keywordMap = {
        'fix': 'Bug Backlog',
        'bug': 'Bug Backlog',
        'test': 'QA',
        'verify': 'QA',
        'release': 'Done',
		'start': 'To Do',
		'implement': 'To do',
		'do': 'To do',
		'design': 'To do ',
		'review': 'In Progress',
		'approve': 'In Progress',
		'completed': 'Done',
		'done': 'Done',
		'finished': 'Done'
    };

    const text = (card.card_name + " " + card.description).toLowerCase();
    
    Object.keys(keywordMap).forEach(key => {
        if(text.includes(key)) {
             suggestions.push({
                 type: 'MOVE',
                 text: `Content mentions '${key}'. Move to ${keywordMap[key]}?`
             });
        }
    });

    const daysSinceUpdate = (new Date() - new Date(card.updated_at)) / (1000 * 60 * 60 * 24);
    if(daysSinceUpdate > 7 && !card.isCompleted) {
        suggestions.push({
            type: 'WARNING',
            text: 'This card hasn\'t been touched in a week. Is it stuck?'
        });
    }

    const currentWords = card.card_name.toLowerCase().split(' ').filter(w => w.length > 4);
    
    const related = allBoardCards
        .filter(c => c._id.toString() !== card._id.toString())
        .map(c => {
            const otherWords = c.card_name.toLowerCase().split(' ');
            const matches = currentWords.filter(w => otherWords.includes(w));
            return { card: c, matches: matches.length };
        })
        .filter(item => item.matches > 0) 
        .sort((a,b) => b.matches - a.matches) 
        .slice(0, 2);

    return {
        suggestions,
        relatedCards: related.map(r => r.card)
    };
}