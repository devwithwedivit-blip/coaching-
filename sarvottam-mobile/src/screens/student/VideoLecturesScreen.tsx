import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { VIDEO_LECTURES_DATA } from '../../data/videoLecturesData';
import { VideoLecture, RelayFile } from '../../types';
import { PcConnectionBanner } from '../../components/common/PcConnectionBanner';
import { relayClient } from '../../services/relay/relayClient';

interface VideoLecturesScreenProps {
  onBack: () => void;
}

export const VideoLecturesScreen: React.FC<VideoLecturesScreenProps> = ({ onBack }) => {
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pcVideos, setPcVideos] = useState<RelayFile[]>([]);
  const [activeStreamUrl, setActiveStreamUrl] = useState<string>('');

  useEffect(() => {
    const unsub = relayClient.onFilesChange((files) => {
      setPcVideos(files.filter(f => f.file_type === 'video'));
    });
    return () => unsub();
  }, []);

  const subjects = ['All', 'PC Synced', 'Botany', 'Physics', 'Mathematics', 'Polity', 'SSB Coaching'];

  const handleSelectPcVideo = async (pv: RelayFile) => {
    const url = await relayClient.getStreamUrl(pv.id);
    setActiveStreamUrl(url);
    setActiveVideo({
      id: pv.id,
      title: pv.title,
      stream: 'PC Host Stream',
      subject: pv.subject || 'All',
      chapter: `${pv.file_size_formatted} · On-Demand Stream`,
      duration: 'Masterclass',
      instructor: 'Sarvottam Faculty',
      views: 120,
      rating: 5.0,
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      videoUrl: url,
      keyTopics: ['Streamed directly from your PC', 'Zero third-party upload delay', pv.original_name],
    });
    setIsPlaying(true);
  };

  const filteredVideos = VIDEO_LECTURES_DATA.filter((v) => {
    const matchesSub = selectedSubject === 'All' || v.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchesQuery = !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSub && matchesQuery;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>HD VIDEO LECTURES</Text>
        </View>
        <Text style={styles.title}>Recorded Video Masterclasses</Text>
        <Text style={styles.subtitle}>
          Curated chapter-wise concept lectures, animated diagrams, and step-by-step problem deconstructions.
        </Text>
      </View>

      {/* Cloud Relay Connection Banner */}
      <PcConnectionBanner />

      {/* Active Video Player Interface */}
      {activeVideo && (
        <View style={styles.playerContainer}>
          <View style={styles.videoWindow}>
            {Platform.OS === 'web' && activeStreamUrl && isPlaying ? (
              // @ts-ignore
              <video
                src={activeStreamUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
              />
            ) : (
              <>
                <Image source={{ uri: activeVideo.thumbnail }} style={styles.playerThumbnail} />
                <View style={styles.playerOverlay}>
                  <TouchableOpacity
                    style={styles.playPauseBtn}
                    onPress={() => setIsPlaying(!isPlaying)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.playerStatus}>
                    {activeStreamUrl
                      ? '⚡ Streaming from PC via Cloud Relay'
                      : isPlaying
                      ? 'Playing in 1080p HD...'
                      : 'Paused · Ready to stream'}
                  </Text>
                </View>

                {/* Custom Video Control Bar */}
                <View style={styles.controlsBar}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                  <View style={styles.controlButtons}>
                    <Text style={styles.durationText}>14:20 / {activeVideo.duration}</Text>
                    <TouchableOpacity
                      style={styles.speedPill}
                      onPress={() => {
                        const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
                        const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                        setPlaybackSpeed(next);
                      }}
                    >
                      <Text style={styles.speedText}>{playbackSpeed}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.playerMeta}>
            <Text style={styles.nowPlayingTitle}>{activeVideo.title}</Text>
            <Text style={styles.nowPlayingSub}>
              {activeVideo.instructor} · {activeVideo.chapter} · ★ {activeVideo.rating}
            </Text>

            <View style={styles.keyTopicsWrap}>
              <Text style={styles.keyTopicsHeading}>Key Topics Covered in this Video:</Text>
              {activeVideo.keyTopics.map((topic, idx) => (
                <View key={idx} style={styles.topicBullet}>
                  <Text style={styles.topicBulletDot}>•</Text>
                  <Text style={styles.topicBulletText}>{topic}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Search & Subject Filters */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by topic, chapter, or title..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {subjects.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[styles.filterPill, selectedSubject === sub && styles.filterPillActive]}
            onPress={() => setSelectedSubject(sub)}
          >
            <Text style={[styles.filterText, selectedSubject === sub && styles.filterTextActive]}>
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PC Synced Videos Section */}
      {pcVideos.length > 0 && (selectedSubject === 'All' || selectedSubject === 'PC Synced') && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f766e', letterSpacing: 0.5 }}>
              💻 DIRECT FROM YOUR PC STORAGE ({pcVideos.length})
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              LIVE RELAY
            </Text>
          </View>
          {pcVideos.map((pv) => (
            <TouchableOpacity
              key={pv.id}
              style={[styles.videoCard, { borderColor: '#10b981', borderWidth: 1.5 }]}
              onPress={() => handleSelectPcVideo(pv)}
              activeOpacity={0.8}
            >
              <View style={[styles.thumbnailWrap, { backgroundColor: '#042f2e' }]}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80' }}
                  style={styles.thumbnail}
                />
                <View style={[styles.durationBadge, { backgroundColor: '#0f766e' }]}>
                  <Text style={styles.durationBadgeText}>{pv.file_size_formatted}</Text>
                </View>
                <View style={styles.playMiniBtn}>
                  <Text style={styles.playMiniIcon}>▶</Text>
                </View>
              </View>

              <View style={styles.videoInfo}>
                <View style={styles.infoTopRow}>
                  <Text style={[styles.subTag, { color: '#0d9488' }]}>🟢 PC HOST STREAM</Text>
                  <Text style={styles.streamTag}>ON-DEMAND</Text>
                </View>
                <Text style={styles.videoCardTitle} numberOfLines={2}>
                  {pv.title}
                </Text>
                <Text style={styles.instructorTxt}>PC Local Disk · {pv.file_size_formatted}</Text>
                <Text style={[styles.viewsTxt, { color: '#0d9488', fontWeight: '700' }]}>
                  ⚡ Tap to stream live from PC
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Video Lecture Cards */}
      {filteredVideos.map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          onPress={() => {
            setActiveVideo(video);
            setIsPlaying(true);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.thumbnailWrap}>
            <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
            <View style={styles.durationBadge}>
              <Text style={styles.durationBadgeText}>{video.duration}</Text>
            </View>
            <View style={styles.playMiniBtn}>
              <Text style={styles.playMiniIcon}>▶</Text>
            </View>
          </View>

          <View style={styles.videoInfo}>
            <View style={styles.infoTopRow}>
              <Text style={styles.subTag}>{video.subject}</Text>
              <Text style={styles.streamTag}>{video.stream}</Text>
            </View>
            <Text style={styles.videoCardTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.instructorTxt}>{video.instructor} · {video.chapter}</Text>
            <Text style={styles.viewsTxt}>👁 {video.views.toLocaleString()} views · ★ {video.rating}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  header: {
    marginBottom: 16,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 10.5,
    fontWeight: '900',
  },
  title: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  playerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.goldBorder,
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoWindow: {
    height: 200,
    position: 'relative',
    backgroundColor: '#050b17',
  },
  playerThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.65,
  },
  playerOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  playPauseIcon: {
    fontSize: 22,
    color: COLORS.navyDeep,
    marginLeft: 2,
  },
  playerStatus: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    backgroundColor: 'rgba(5, 11, 23, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(5, 11, 23, 0.85)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    width: '35%',
    height: '100%',
    backgroundColor: COLORS.goldBright,
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  speedPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speedText: {
    color: COLORS.goldBright,
    fontSize: 10.5,
    fontWeight: '800',
  },
  playerMeta: {
    padding: 16,
  },
  nowPlayingTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '800',
  },
  nowPlayingSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  keyTopicsWrap: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
  },
  keyTopicsHeading: {
    color: COLORS.navy,
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  topicBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  topicBulletDot: {
    color: COLORS.goldBright,
    fontSize: 12,
    fontWeight: '900',
  },
  topicBulletText: {
    color: '#475569',
    fontSize: 11.5,
    flex: 1,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: COLORS.goldBright,
  },
  videoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  thumbnailWrap: {
    width: 120,
    height: 90,
    position: 'relative',
    backgroundColor: '#0f172a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  playMiniBtn: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMiniIcon: {
    color: '#ffffff',
    fontSize: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  videoInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  infoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  subTag: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  streamTag: {
    color: '#64748b',
    fontSize: 9.5,
    fontWeight: '700',
  },
  videoCardTitle: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  instructorTxt: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 3,
  },
  viewsTxt: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
});
