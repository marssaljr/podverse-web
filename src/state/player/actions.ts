import OmniAural from "omniaural"
import type { NowPlayingItem } from "podverse-shared"

const togglePlayer = (show: boolean) => {
  OmniAural.state.player.show.set(show)
}

const setPlayerItem = (currentNowPlayingItem: NowPlayingItem) => {
  OmniAural.state.player.currentNowPlayingItem.set(currentNowPlayingItem)
  OmniAural.state.player.show.set(true)
}

const setPlayerPlaybackPosition = (position: number) => {
  OmniAural.state.player.playbackPosition.set(Math.floor(position))
}

const setPlayerDuration = (duration: number) => {
  OmniAural.state.player.duration.set(Math.floor(duration))
}

const setPlaySpeed = (newSpeed: number) => {
  OmniAural.state.player.playSpeed.set(newSpeed)
}

const pausePlayer = () => {
  OmniAural.state.player.paused.set(true)
}

const playPlayer = () => {
  OmniAural.state.player.paused.set(false)
}

const playerSetVolume = (newVolume: number) => {
  OmniAural.state.player.volume.set(newVolume)
}

const mutePlayer = () => {
  OmniAural.state.player.muted.set(true)
}

const unmutePlayer = () => {
  OmniAural.state.player.muted.set(false)
}

OmniAural.addActions({ mutePlayer, pausePlayer, playerSetVolume, playPlayer,
  setPlayerDuration, setPlayerItem, setPlayerPlaybackPosition, setPlaySpeed,
  togglePlayer, unmutePlayer })
