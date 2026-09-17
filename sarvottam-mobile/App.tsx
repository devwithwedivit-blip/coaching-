import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ExamProvider, useExam } from './src/context/ExamContext';
import { Header } from './src/components/common/Header';
import { TabBar, TabScreenName } from './src/components/common/TabBar';
import { COLORS } from './src/constants/theme';
import { CourseVertical } from './src/types';

// Auth Screens
import { RoleSelectScreen } from './src/screens/auth/RoleSelectScreen';
import { StudentLoginScreen } from './src/screens/auth/StudentLoginScreen';
import { AdminLoginScreen } from './src/screens/auth/AdminLoginScreen';

// Student Screens
import { HomeScreen } from './src/screens/student/HomeScreen';
import { CoursesScreen } from './src/screens/student/CoursesScreen';
import { CourseDetailScreen } from './src/screens/student/CourseDetailScreen';
import { LiveClassesScreen } from './src/screens/student/LiveClassesScreen';
import { VideoLecturesScreen } from './src/screens/student/VideoLecturesScreen';
import { StudyMaterialsScreen } from './src/screens/student/StudyMaterialsScreen';
import { DoubtSessionScreen } from './src/screens/student/DoubtSessionScreen';
import { CbtExamListScreen } from './src/screens/student/CbtExamListScreen';
import { CbtExamActiveScreen } from './src/screens/student/CbtExamActiveScreen';
import { CbtResultScreen } from './src/screens/student/CbtResultScreen';
import { StudentHelpCentreScreen } from './src/screens/student/StudentHelpCentreScreen';
import { CustomerHelpCentreScreen } from './src/screens/student/CustomerHelpCentreScreen';
import { StudentProfileScreen } from './src/screens/student/StudentProfileScreen';

// Admin Screens
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { CandidateRegistryScreen } from './src/screens/admin/CandidateRegistryScreen';
import { ProctorTelemetryScreen } from './src/screens/admin/ProctorTelemetryScreen';

const MainAppContent: React.FC = () => {
  const { role, switchRole, student } = useAuth();
  const { startExam } = useExam();

  // Navigation Stack States
  const [authSubScreen, setAuthSubScreen] = useState<'role' | 'student_login' | 'admin_login'>('role');
  const [currentTab, setCurrentTab] = useState<TabScreenName>('home');
  const [studentSubScreen, setStudentSubScreen] = useState<string | null>(null);
  const [adminSubScreen, setAdminSubScreen] = useState<'dashboard' | 'candidates' | 'proctor'>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<CourseVertical | null>(null);

  // 1. Role Selection & Authentication Flow
  if (!role) {
    if (authSubScreen === 'student_login') {
      return (
        <StudentLoginScreen
          onSuccess={() => {
            setAuthSubScreen('role');
          }}
          onBack={() => setAuthSubScreen('role')}
        />
      );
    }

    if (authSubScreen === 'admin_login') {
      return (
        <AdminLoginScreen
          onSuccess={() => {
            setAuthSubScreen('role');
          }}
          onBack={() => setAuthSubScreen('role')}
        />
      );
    }

    return (
      <RoleSelectScreen
        onSelectStudent={() => {
          if (student) {
            switchRole('student');
          } else {
            setAuthSubScreen('student_login');
          }
        }}
        onSelectAdmin={() => setAuthSubScreen('admin_login')}
      />
    );
  }

  // 2. Admin Portal View
  if (role === 'admin') {
    return (
      <View style={styles.appContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />
        <Header
          title="SNTRA ADMIN"
          subtitle="EXAMINATION TELEMETRY"
          showBack={adminSubScreen !== 'dashboard'}
          onBack={() => setAdminSubScreen('dashboard')}
        />

        <View style={styles.screenBody}>
          {adminSubScreen === 'candidates' ? (
            <CandidateRegistryScreen onBack={() => setAdminSubScreen('dashboard')} />
          ) : adminSubScreen === 'proctor' ? (
            <ProctorTelemetryScreen onBack={() => setAdminSubScreen('dashboard')} />
          ) : (
            <AdminDashboardScreen onNavigate={(screen) => setAdminSubScreen(screen as any)} />
          )}
        </View>
      </View>
    );
  }

  // 3. Student Portal View
  // Dedicated Full-Screen CBT Test Room (No Header or TabBar to prevent test-taking distractions)
  if (studentSubScreen === 'cbt_active') {
    return (
      <View style={styles.appContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#050b17" />
        <CbtExamActiveScreen
          onFinish={() => setStudentSubScreen('cbt_result')}
          onExit={() => setStudentSubScreen(null)}
        />
      </View>
    );
  }

  const renderStudentContent = () => {
    // Check for active sub-screens first
    if (studentSubScreen === 'course_detail' && selectedCourse) {
      return (
        <CourseDetailScreen
          course={selectedCourse}
          onBack={() => setStudentSubScreen(null)}
          onLaunchCbt={() => {
            startExam();
            setStudentSubScreen('cbt_active');
          }}
        />
      );
    }

    if (studentSubScreen === 'live_classes') {
      return <LiveClassesScreen onBack={() => setStudentSubScreen(null)} />;
    }

    if (studentSubScreen === 'video_lectures') {
      return <VideoLecturesScreen onBack={() => setStudentSubScreen(null)} />;
    }

    if (studentSubScreen === 'study_materials') {
      return <StudyMaterialsScreen onBack={() => setStudentSubScreen(null)} />;
    }

    if (studentSubScreen === 'doubts_hub') {
      return <DoubtSessionScreen onBack={() => setStudentSubScreen(null)} />;
    }

    if (studentSubScreen === 'cbt_list') {
      return (
        <CbtExamListScreen
          onStartExam={() => setStudentSubScreen('cbt_active')}
          onBack={() => setStudentSubScreen(null)}
        />
      );
    }

    if (studentSubScreen === 'cbt_result') {
      return (
        <CbtResultScreen
          onRetake={() => {
            startExam();
            setStudentSubScreen('cbt_active');
          }}
          onHome={() => {
            setStudentSubScreen(null);
            setCurrentTab('home');
          }}
        />
      );
    }

    if (studentSubScreen === 'student_help') {
      return <StudentHelpCentreScreen onBack={() => setStudentSubScreen(null)} />;
    }

    if (studentSubScreen === 'customer_help') {
      return <CustomerHelpCentreScreen onBack={() => setStudentSubScreen(null)} />;
    }

    // Main Bottom Tab Screens
    switch (currentTab) {
      case 'courses':
        return (
          <CoursesScreen
            onSelectCourse={(c) => {
              setSelectedCourse(c);
              setStudentSubScreen('course_detail');
            }}
            onLaunchCbtMock={() => {
              startExam();
              setStudentSubScreen('cbt_active');
            }}
          />
        );
      case 'cbt':
        return (
          <CbtExamListScreen
            onStartExam={() => setStudentSubScreen('cbt_active')}
            onBack={() => setCurrentTab('home')}
          />
        );
      case 'doubts':
        return <DoubtSessionScreen onBack={() => setCurrentTab('home')} />;
      case 'profile':
        return (
          <StudentProfileScreen
            onNavigate={(screen) => setStudentSubScreen(screen)}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigate={(screen, params) => {
              if (screen === 'courses') {
                setCurrentTab('courses');
                setStudentSubScreen(null);
              } else if (screen === 'course_detail' && params?.course) {
                setSelectedCourse(params.course);
                setStudentSubScreen('course_detail');
              } else {
                setStudentSubScreen(screen);
              }
            }}
          />
        );
    }
  };

  const getHeaderTitle = () => {
    if (studentSubScreen === 'course_detail') return selectedCourse?.title || 'Course Details';
    if (studentSubScreen === 'live_classes') return 'Live Classes';
    if (studentSubScreen === 'video_lectures') return 'Video Lectures';
    if (studentSubScreen === 'study_materials') return 'Study Materials';
    if (studentSubScreen === 'doubts_hub') return 'Doubt Resolution';
    if (studentSubScreen === 'cbt_list') return 'CBT Mock Examinations';
    if (studentSubScreen === 'cbt_result') return 'CBT Scorecard';
    if (studentSubScreen === 'student_help') return 'Student Help Centre';
    if (studentSubScreen === 'customer_help') return '24/7 Helpline';
    if (currentTab === 'courses') return 'Flagship Courses';
    if (currentTab === 'cbt') return 'Online CBT Testing';
    if (currentTab === 'doubts') return 'Doubt Session';
    if (currentTab === 'profile') return 'Candidate Profile';
    return 'SARVOTTAM';
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDeep} />
      <Header
        title={getHeaderTitle()}
        showBack={!!studentSubScreen}
        onBack={() => setStudentSubScreen(null)}
      />

      <View style={styles.screenBody}>
        {renderStudentContent()}
      </View>

      {/* Hide bottom tabbar when inside sub-screens to maximize content viewing */}
      {!studentSubScreen && (
        <TabBar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setStudentSubScreen(null);
          }}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <MainAppContent />
      </ExamProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  screenBody: {
    flex: 1,
  },
});
