import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import OmniAural, { useOmniAural } from 'omniaural'
import { useState } from 'react'
import { convertNowPlayingItemToEpisode, convertNowPlayingItemToMediaRef,
  NowPlayingItem } from 'podverse-shared'
import { ClipListItem, ColumnsWrapper, EpisodeListItem, List, PageHeader, PageScrollableContent,
  SideContent } from '~/components'
import { Page } from '~/lib/utility/page'
import { PV } from '~/resources'
import { getServerSideAuthenticatedUserInfo } from '~/services/auth'
import { getServerSideUserQueueItems } from '~/services/userQueueItem'

interface ServerProps extends Page {}

const keyPrefix = 'pages_queue'

export default function Queue(props: ServerProps) {

  /* Initialize */

  const { t } = useTranslation()
  const [userInfo] = useOmniAural('session.userInfo')
  const [userQueueItems] = useOmniAural('userQueueItems')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const pageTitle = t('Queue')
  const hasEditButton = !!userInfo

  /* Function helpers */

  const _removeQueueItemsAll = async () => {
    const answer = window.confirm(t('Are you sure you want to remove all of your queue items?'))
    if (answer) {
      OmniAural.pageIsLoadingShow()
      await OmniAural.removeQueueItemsAll()
      OmniAural.pageIsLoadingHide()
    }
  }

  /* Render Helpers */

  const generateQueueListElements = (queueItems: NowPlayingItem[]) => {
    return queueItems.map((queueItem, index) => {
      if (queueItem.clipId) {
        const mediaRef = convertNowPlayingItemToMediaRef(queueItem)
        return (
          <ClipListItem
            episode={mediaRef.episode}
            handleRemove={() => OmniAural.removeQueueItemMediaRef(mediaRef.id)}
            key={`${keyPrefix}-clip-${index}`}
            mediaRef={mediaRef}
            /* *TODO* Remove the "as any" below without throwing a Typescript error */
            podcast={mediaRef.episode.podcast as any}
            showImage
            showRemoveButton={isEditing} />
        )
      } else {
        const episode = convertNowPlayingItemToEpisode(queueItem)
        return (
          <EpisodeListItem
            episode={episode}
            handleRemove={() => OmniAural.removeQueueItemEpisode(episode.id)}
            key={`${keyPrefix}-episode-${index}`}
            /* *TODO* Remove the "as any" below without throwing a Typescript error */
            podcast={episode.podcast as any}
            showImage
            showRemoveButton={isEditing} />
        )
      }
    })
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageHeader
        isEditing={isEditing}
        handleClearAllButton={_removeQueueItemsAll}
        handleEditButton={() => setIsEditing(!isEditing)}
        hasEditButton={hasEditButton}
        text={t('Queue')} />
      <PageScrollableContent noMarginTop>
        <ColumnsWrapper
          mainColumnChildren={
            <List>{generateQueueListElements(userQueueItems)}</List>
          }
          sideColumnChildren={<SideContent />}
         />
      </PageScrollableContent>
    </>
  )
}

/* Server-Side Logic */

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, locale } = ctx
  const { cookies } = req

  const userInfo = await getServerSideAuthenticatedUserInfo(cookies)
  const userQueueItems = await getServerSideUserQueueItems(cookies)

  const serverProps: ServerProps = {
    serverUserInfo: userInfo,
    serverUserQueueItems: userQueueItems,
    ...(await serverSideTranslations(locale, PV.i18n.fileNames.all)),
    serverCookies: cookies
  }

  return { props: serverProps }
}
