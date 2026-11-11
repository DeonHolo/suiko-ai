import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import reviewPage from '../../client/index.html'

UiPage({
    $id: Now.ID['suiko-review-page'],
    endpoint: 'x_2236136_suiko_ai_review.do',
    description: 'Suiko AI review workbench',
    category: 'general',
    html: reviewPage,
    direct: true,
})
