import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { PDF_MATERIALS_DATA } from '../../data/pdfMaterialsData';
import { StudyMaterial, RelayFile } from '../../types';
import { CustomButton } from '../../components/common/CustomButton';
import { PcConnectionBanner } from '../../components/common/PcConnectionBanner';
import { relayClient } from '../../services/relay/relayClient';

interface StudyMaterialsScreenProps {
  onBack: () => void;
}

export const StudyMaterialsScreen: React.FC<StudyMaterialsScreenProps> = ({ onBack }) => {
  const [activePdf, setActivePdf] = useState<StudyMaterial | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingPage, setReadingPage] = useState(1);
  const [pcPdfs, setPcPdfs] = useState<RelayFile[]>([]);
  const [isOpeningId, setIsOpeningId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = relayClient.onFilesChange((files) => {
      setPcPdfs(files.filter(f => f.file_type === 'pdf'));
    });
    return () => unsub();
  }, []);

  const categories = ['All', '💻 PC Synced', 'Formula Sheet', 'PYQ Paper', 'Chapter Notes', 'NCERT Summary'];

  const handleOpenPcPdf = async (pdf: RelayFile, isDownload = false) => {
    setIsOpeningId(pdf.id);
    try {
      const url = isDownload
        ? await relayClient.getDownloadUrl(pdf.id)
        : await relayClient.getStreamUrl(pdf.id);

      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch {
      Alert.alert('Transfer Error', 'Could not stream PDF from PC. Ensure your PC is running the sync client.');
    } finally {
      setIsOpeningId(null);
    }
  };

  const filteredPdfs = PDF_MATERIALS_DATA.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDownload = (pdf: StudyMaterial) => {
    Alert.alert(
      'Document Downloaded',
      `"${pdf.title}" (${pdf.fileSize}) has been saved to your device's Offline Storage for quick revision without internet.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>OFFICIAL STUDY PACKS</Text>
        </View>
        <Text style={styles.title}>PDF Notes & Question Papers</Text>
        <Text style={styles.subtitle}>
          Curated chapter summaries, formula handbooks, previous years solved papers, and NCERT line-by-line notes.
        </Text>
      </View>

      {/* Cloud Relay Connection Banner */}
      <PcConnectionBanner />

      {/* Search Input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search study materials & formulas..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PC Synced Documents */}
      {pcPdfs.length > 0 && (selectedCategory === 'All' || selectedCategory === '💻 PC Synced') && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f766e', letterSpacing: 0.5 }}>
              💻 LIVE PC DOCUMENTS ({pcPdfs.length})
            </Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              TRANSFER ON CLICK
            </Text>
          </View>

          {pcPdfs
            .filter((p) => !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p) => (
              <View key={p.id} style={[styles.pdfCard, { borderColor: '#10b981', borderWidth: 1.5 }]}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.pdfIconWrap, { backgroundColor: '#ccfbf1' }]}>
                    <Text style={[styles.pdfIconText, { color: '#0f766e' }]}>⚡</Text>
                  </View>
                  <View style={styles.metaWrap}>
                    <View style={styles.tagRow}>
                      <Text style={[styles.categoryBadge, { backgroundColor: '#d1fae5', color: '#065f46' }]}>
                        PC STORAGE
                      </Text>
                      <Text style={[styles.streamBadge, { color: '#0f766e' }]}>ON-DEMAND</Text>
                    </View>
                    <Text style={styles.pdfTitle}>{p.title}</Text>
                  </View>
                </View>

                <Text style={styles.descText}>
                  Stored locally on your PC ({p.relative_path}). Instant chunk transfer when tapped.
                </Text>

                <View style={styles.statsRow}>
                  <Text style={styles.statLabel}>📦 {p.file_size_formatted}</Text>
                  <Text style={styles.statLabel}>📄 PDF Document</Text>
                  <Text style={[styles.statLabel, { color: '#059669', fontWeight: '700' }]}>🟢 Direct Stream Ready</Text>
                </View>

                <View style={styles.actionRow}>
                  <CustomButton
                    title={isOpeningId === p.id ? 'Connecting...' : 'Read Online (Stream from PC) 📖'}
                    onPress={() => handleOpenPcPdf(p, false)}
                    variant="secondary"
                    size="small"
                    style={{ flex: 1 }}
                  />
                  <CustomButton
                    title="Download ⬇️"
                    onPress={() => handleOpenPcPdf(p, true)}
                    variant="primary"
                    size="small"
                    style={{ width: 110 }}
                  />
                </View>
              </View>
            ))}
        </View>
      )}

      {/* PDF List */}
      {filteredPdfs.map((pdf) => (
        <View key={pdf.id} style={styles.pdfCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.pdfIconWrap}>
              <Text style={styles.pdfIconText}>📄</Text>
            </View>
            <View style={styles.metaWrap}>
              <View style={styles.tagRow}>
                <Text style={styles.categoryBadge}>{pdf.category}</Text>
                <Text style={styles.streamBadge}>{pdf.stream}</Text>
              </View>
              <Text style={styles.pdfTitle}>{pdf.title}</Text>
            </View>
          </View>

          <Text style={styles.descText}>{pdf.description}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>📦 {pdf.fileSize}</Text>
            <Text style={styles.statLabel}>📑 {pdf.pages} Pages</Text>
            <Text style={styles.statLabel}>⬇️ {pdf.downloadCount.toLocaleString()} Downloads</Text>
          </View>

          <View style={styles.actionRow}>
            <CustomButton
              title="Read Online 📖"
              onPress={() => {
                setActivePdf(pdf);
                setReadingPage(1);
              }}
              variant="secondary"
              size="small"
              style={{ flex: 1 }}
            />
            <CustomButton
              title="Save Offline ⬇️"
              onPress={() => handleDownload(pdf)}
              variant="primary"
              size="small"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ))}

      {/* In-App PDF Reader Modal */}
      {activePdf && (
        <Modal visible={!!activePdf} animationType="slide" onRequestClose={() => setActivePdf(null)}>
          <View style={styles.readerContainer}>
            <View style={styles.readerHeader}>
              <TouchableOpacity onPress={() => setActivePdf(null)} style={styles.readerCloseBtn}>
                <Text style={styles.readerCloseText}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.readerTitle} numberOfLines={1}>
                {activePdf.title}
              </Text>
              <TouchableOpacity onPress={() => handleDownload(activePdf)}>
                <Text style={styles.readerDownloadIcon}>⬇️</Text>
              </TouchableOpacity>
            </View>

            {/* Document Viewer Page Simulation */}
            <ScrollView style={styles.readerBody} contentContainerStyle={styles.readerPage}>
              <View style={styles.paperSheet}>
                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>SARVOTTAM INSTITUTES</Text>
                </View>
                <Text style={styles.docHeaderSubject}>{activePdf.subject.toUpperCase()} NOTES</Text>
                <Text style={styles.docMainTitle}>{activePdf.title}</Text>
                <Text style={styles.docSubInfo}>
                  Category: {activePdf.category} · Target: {activePdf.stream} · Page {readingPage} of {activePdf.pages}
                </Text>

                <View style={styles.docDivider} />

                <Text style={styles.sectionHeader}>Key High-Yield Concepts & Formulas:</Text>
                <Text style={styles.bodyParagraph}>
                  1. Biological Hierarchy & Cellular Energetics: In eukaryotic cellular respiration, the transition reaction links cytoplasmic glycolysis to mitochondrial matrix Krebs cycle via oxidative decarboxylation of pyruvate catalyzed by Pyruvate Dehydrogenase Complex.
                </Text>
                <Text style={styles.formulaBox}>
                  Pyruvate + CoA + NAD⁺ → Acetyl-CoA + CO₂ + NADH + H⁺
                </Text>
                <Text style={styles.bodyParagraph}>
                  2. Net ATP Harvest: Oxidation of one molecule of glucose under aerobic conditions yields 36 or 38 ATP molecules, accounting for the malate-aspartate or glycerol-phosphate shuttle mechanisms across the inner mitochondrial membrane.
                </Text>

                <Text style={styles.sectionHeader}>Exam Pitfall Alerts:</Text>
                <Text style={styles.bodyParagraph}>
                  • In Section B questions, watch out for the phrasing "Net gain of ATP" versus "Total ATP generated". Net gain in glycolysis alone is strictly 2 ATP molecules.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Page Navigation */}
            <View style={styles.readerFooter}>
              <TouchableOpacity
                style={styles.pageBtn}
                onPress={() => setReadingPage(Math.max(1, readingPage - 1))}
                disabled={readingPage <= 1}
              >
                <Text style={styles.pageBtnText}>‹ Previous Page</Text>
              </TouchableOpacity>
              <Text style={styles.pageNumberIndicator}>
                Page {readingPage} / {activePdf.pages}
              </Text>
              <TouchableOpacity
                style={styles.pageBtn}
                onPress={() => setReadingPage(Math.min(activePdf.pages, readingPage + 1))}
                disabled={readingPage >= activePdf.pages}
              >
                <Text style={styles.pageBtnText}>Next Page ›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    marginBottom: 6,
  },
  badgeText: {
    color: '#8b5cf6',
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
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  catPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catPillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  catText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  catTextActive: {
    color: COLORS.goldBright,
  },
  pdfCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0e1f3d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  pdfIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconText: {
    fontSize: 22,
  },
  metaWrap: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  categoryBadge: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  streamBadge: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  pdfTitle: {
    color: COLORS.navy,
    fontSize: 14.5,
    fontWeight: '800',
    lineHeight: 19,
  },
  descText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
    marginVertical: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 4,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  // In-App Reader Styles
  readerContainer: {
    flex: 1,
    backgroundColor: '#050b17',
  },
  readerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0e1f3d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  readerCloseBtn: {
    padding: 6,
  },
  readerCloseText: {
    color: COLORS.goldBright,
    fontSize: 14,
    fontWeight: '700',
  },
  readerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    maxWidth: '65%',
  },
  readerDownloadIcon: {
    fontSize: 18,
  },
  readerBody: {
    flex: 1,
    backgroundColor: '#334155',
  },
  readerPage: {
    padding: 16,
  },
  paperSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    minHeight: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.04,
  },
  watermarkText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    transform: [{ rotate: '-35deg' }],
  },
  docHeaderSubject: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  docMainTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  docSubInfo: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  docDivider: {
    height: 1.5,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  sectionHeader: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  bodyParagraph: {
    color: '#1e293b',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  formulaBox: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginVertical: 8,
  },
  readerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0e1f3d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  pageBtnText: {
    color: COLORS.goldBright,
    fontSize: 12,
    fontWeight: '700',
  },
  pageNumberIndicator: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
