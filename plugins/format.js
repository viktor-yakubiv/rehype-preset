import rehypeFormat from 'rehype-format'

/**
 * Processor#use() will essentially add a plugin entry to the end of its list
 * ensuring that formatter is called after everything else.
 */
export default function finalFormatter(options) {
	this.use(rehypeFormat, options)
}
