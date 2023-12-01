import absoluteUrls from './plugins/absolute-urls.js'
import dataLoader from './plugins/data-loader.js'
import localTransformer from './plugins/local-transformer.js'
import finalFormatter from './plugins/format.js'

export default {
	plugins: [
		absoluteUrls,
		dataLoader,
		localTransformer,
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
