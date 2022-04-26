   const getMaxNextLine = (input, maxChars = 20) => {
    const Dados_split = input.split(" ");

    const lineIndex = Dados_split.reduce((prev, cur, index) => {
        if (prev ?. done) return prev;

        const endLastWord = prev ?. position || 0;
        const position = endLastWord + 1 + cur.length;
        return position >= maxChars ? {
            done: true,
            index
        } : {
            position,
            index
        };
    });
    // Using the index, build a string for this line ...
    const line = Dados_split.slice(0, lineIndex.index).join(" ");
    // And determine what's left.
    const remainingChars = Dados_split.slice(lineIndex.index).join(" ");
    // Return the result.
    return {
        line,
        remainingChars
    };
};

exports.formatTitle = (title) => {
    let output = [];
    // If the title is 40 characters or longer, look to add ellipses at the end of
    // the second line.
    if (title.length >= 40) {
        const firstLine = getMaxNextLine(title);
        const secondLine = getMaxNextLine(firstLine.remainingChars);
        output = [firstLine.line];
        let fmSecondLine = secondLine.line;
        if (secondLine.remainingChars.length > 0) fmSecondLine += " ...";
        output.push(fmSecondLine);
    }
    // If 20 characters or longer, add the entire second line, using a max of half
    // the characters, making the first line always slightly shorter than the
    // second.
    else if (title.length >= 20) {
        const firstLine = getMaxNextLine(title, title.length / 2);
        output = [firstLine.line, firstLine.remainingChars];
    }
    // Otherwise, return the short title.
    else {
        output = [title];
    }

    return output;
};