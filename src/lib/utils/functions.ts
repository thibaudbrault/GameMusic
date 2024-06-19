import {
	audio,
	currentTime,
	isPlayerOpen,
	isLoading,
	isLooped,
	isPlaying,
	isShuffled,
	length,
	musics,
	sliderValue,
	title,
	trackId,
} from '$lib/store';
import type { ScrollDir } from '$lib/types';
import { get } from 'svelte/store';

export const scrollFn = (area: HTMLElement | undefined, dir: ScrollDir) => {
	if (!area) return;
	if (dir === 'next') {
		area.scrollLeft += 216;
	} else if (dir === 'prev') {
		area.scrollLeft -= 216;
	}
};

export const scrollIntoView = (currentTrackId: number) => {
	const track = document.getElementById(`track-${currentTrackId}`);
	track?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

export const loadTrack = () => {
	isLoading.set(true);
	sliderValue.set(0);
	if (get(length) > 0) {
		title.set(get(musics)[get(trackId)]?.name);
		audio.update(($audio) => {
			$audio.src = get(musics)[get(trackId)]?.url;
			if (get(isPlaying)) {
				$audio.play();
			}
			return $audio;
		});
		isPlayerOpen.set(true);
	}
};

export const handlePlaying = (raf: number) => {
	sliderValue.set(get(audio).currentTime);
	currentTime.set(get(sliderValue));
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	raf = requestAnimationFrame(handlePlaying);
};

export const playPauseTrack = (raf: number) => {
	if (get(isPlaying)) {
		audio.update(($audio) => {
			$audio.pause();
			return $audio;
		});
		isPlaying.set(false);
		cancelAnimationFrame(raf);
	} else {
		audio.update(($audio) => {
			$audio.play();
			return $audio;
		});
		isPlaying.set(true);
		requestAnimationFrame(handlePlaying);
	}
};

export const prevTrack = () => {
	currentTime.set(0);
	let currentTrackId = get(trackId);
	if (get(isShuffled)) {
		trackId.set(Math.floor(Math.random() * get(length)));
	} else if (get(isLooped)) {
		trackId.set(get(trackId));
	} else {
		if (get(trackId) > 0) {
			trackId.set((currentTrackId -= 1));
			scrollIntoView(currentTrackId);
		} else {
			trackId.set(get(length) - 1);
			scrollIntoView(currentTrackId);
		}
	}
	loadTrack();
	switchTrack();
};

export const nextTrack = () => {
	currentTime.set(0);
	let currentTrackId = get(trackId);
	if (get(isShuffled)) {
		trackId.set(Math.floor(Math.random() * get(length)));
	} else if (get(isLooped)) {
		trackId.set(get(trackId));
	} else {
		if (get(trackId) < get(length) - 1) {
			trackId.set((currentTrackId += 1));
			scrollIntoView(currentTrackId);
		} else {
			trackId.set(0);
			scrollIntoView(currentTrackId);
		}
	}
	loadTrack();
	switchTrack();
};

export const switchTrack = () => {
	if (get(isPlaying)) {
		audio.update(($audio) => {
			$audio.play();
			return $audio;
		});
	}
};
