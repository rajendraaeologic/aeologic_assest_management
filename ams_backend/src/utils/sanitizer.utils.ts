import sanitizeHtml from 'sanitize-html';

export const sanitizeContent = (content: string): string => {
    return sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt'],
        },
    });
};
