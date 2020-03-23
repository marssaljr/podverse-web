import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addItemsToSecondaryQueueStorage, clearItemsFromSecondaryQueueStorage } from 'podverse-ui'
import MediaListCtrl from '~/components/MediaListCtrl/MediaListCtrl'
import Meta from '~/components/Meta/Meta'
import { convertToNowPlayingItem } from '~/lib/nowPlayingItem'
import { clone, getUrlFromRequestOrWindow } from '~/lib/utility'
import { pageIsLoading, pagesSetQueryState, playerQueueLoadSecondaryItems
  } from '~/redux/actions'
import { getEpisodesByQuery, getMediaRefsByQuery } from '~/services'

type Props = {
  lastScrollPosition?: number
  listItems?: any
  meta?: any
  pageKey?: string
  pagesSetQueryState?: any
  playerQueue?: any
  queryFrom?: any
  queryPage: number
  querySort?: any
  queryType?: any
  user?: any
  userSetInfo?: any
}

type State = {}

const kPageKey = 'home'

class Home extends Component<Props, State> {

  static async getInitialProps({ query, req, store }) {
    const state = store.getState()
    const { mediaPlayer, pages, user } = state
    const { nowPlayingItem } = mediaPlayer
    const currentPage = pages[kPageKey] || {}
    const lastScrollPosition = currentPage.lastScrollPosition
    const queryFrom = currentPage.queryFrom || query.from || (user && user.id ? 'subscribed-only' : 'all-podcasts')
    const queryPage = currentPage.queryPage || query.page || 1
    const querySort = currentPage.querySort || query.sort || (user && user.id ? 'most-recent' : 'top-past-week')
    const queryType = currentPage.queryType || query.type || (user && user.id ? 'episodes' : 'clips')
    let podcastId = ''

    if (queryFrom === 'subscribed-only') {
      podcastId = user.subscribedPodcastIds
    }

    if (Object.keys(currentPage).length === 0) {
      let results

      if (queryType === 'episodes') {
        results = await getEpisodesByQuery({
          from: queryFrom,
          page: queryPage,
          ...(podcastId ? { podcastId } : {}),
          sort: querySort,
          type: queryType,
          includePodcast: true
        })
      } else {
        results = await getMediaRefsByQuery({
          from: queryFrom,
          includePodcast: true,
          page: queryPage,
          ...(podcastId ? { podcastId } : {}),
          sort: querySort,
          type: queryType
        })
      }
      
      const listItems = results.data[0].map(x => convertToNowPlayingItem(x, null, null)) || []
      const nowPlayingItemIndex = listItems.map((x) => x.clipId).indexOf(nowPlayingItem && nowPlayingItem.clipId)
      const queuedListItems = clone(listItems)
      if (nowPlayingItemIndex > -1) {
        queuedListItems.splice(0, nowPlayingItemIndex + 1)
      }

      store.dispatch(playerQueueLoadSecondaryItems(queuedListItems))
      
      store.dispatch(pagesSetQueryState({
        pageKey: kPageKey,
        listItems,
        listItemsTotal: results.data[1],
        queryFrom,
        queryPage,
        querySort,
        queryType
      }))
    }
    
    store.dispatch(pageIsLoading(false))

    const meta = {
      currentUrl: getUrlFromRequestOrWindow(req),
      description: 'Podcast app for iOS, Android, and web. Sync your queue across all devices. Create and share podcast highlights, playlists, and your listener profile. Open source software (AGPLv3).',
      title: 'Podverse - Sync your podcasts across iOS, Android, and web. Create podcast highlights and playlists. Open source.'
    }

    return { lastScrollPosition, meta, pageKey: kPageKey, queryFrom, queryPage, querySort,
      queryType }
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const { playerQueue } = this.props
    const { secondaryItems } = playerQueue
    clearItemsFromSecondaryQueueStorage()
    addItemsToSecondaryQueueStorage(secondaryItems)
  }

  render() {
    const { meta, pagesSetQueryState, queryFrom, queryPage, querySort, queryType
      } = this.props
    
    return (
      <Fragment>
        <Meta
          description={meta.description}
          ogDescription={meta.description}
          ogTitle={meta.title}
          ogType='website'
          ogUrl={meta.currentUrl}
          robotsNoIndex={false}
          title={meta.title}
          twitterDescription={meta.description}
          twitterTitle={meta.title} />
        <MediaListCtrl
          adjustTopPosition
          handleSetPageQueryState={pagesSetQueryState}
          pageKey={kPageKey}
          queryFrom={queryFrom}
          queryPage={queryPage}
          querySort={querySort}
          queryType={queryType} />
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => ({
  pagesSetQueryState: bindActionCreators(pagesSetQueryState, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
