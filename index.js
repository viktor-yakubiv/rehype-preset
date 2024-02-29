import absoluteUrls from 'rehype-absolute-urls'
import dataLoader from './plugins/data-loader.js'
import localTransformer from './plugins/local-transformer.js'
import layout from './plugins/layout.js'
import finalFormatter from './plugins/format.js'

export default {
	plugins: [
		absoluteUrls,
		dataLoader,
		localTransformer,
		[layout, { preprocess: true }],
		finalFormatter,
	],

	settings: {
		preferUnquoted: true,
		omitOptionalTags: true,
		collapseEmptyAttributes: true,
		allowDangerousCharacters: true,
		entities: {
			useNamedReferences: true,
		},
	}
}
