import { functions, httpsCallable } from "@/firebase/firebase";

export const doGenerateElevenLabsSpeech = async (text: string, speed: number = 1.0) => {
  try {
    const generateElevenLabsSpeech = httpsCallable(functions, "generateElevenLabsSpeech");
    const response = await generateElevenLabsSpeech({ text, speed });
    return response.data;
  } catch (error) {
    console.error("Error generating ElevenLabs speech:", error);
    throw error;
  }
};

export const doGenerateSpeech = async (
  text: string,
  gradeLevel: string | null = null,
) => {
  try {
    const generateSpeech = httpsCallable(functions, "setGenerateSpeech");
    const response = await generateSpeech({ text, gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const doExtractTextFromPDF = async (fileUrl: string) => {
  try {
    const extractText = httpsCallable(functions, "setExtractTextFromPDF");
    const response = await extractText({ fileUrl });
    return response.data;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
};

// Call getAllUsersCurrentMonthActivities Cloud Function
export const doGetAllUsersCurrentMonthActivities = async (startDate: string, endDate: string) => {
  try {
    const getAllUsersActivities = httpsCallable(functions, "getAllUsersCurrentMonthActivities");
    const response = await getAllUsersActivities({ startDate, endDate });
    return response.data;
  } catch (error) {
    console.error("Error fetching all users' current month activities:", error);
    throw error;
  }
};

// Call getCurrentMonthActivities Cloud Function
export const doGetCurrentMonthActivities = async (uid: string) => {
  try {
    const getCurrentMonthActivities = httpsCallable(functions, "getCurrentMonthActivities");
    const response = await getCurrentMonthActivities({ uid });
    return response.data;
  } catch (error) {
    console.error("Error fetching current month activities:", error);
    throw error;
  }
};

export const doCheckUserProfileDuplicates = async (uid: string, displayName: string, phoneNumber: string) => {
  try {
    const checkUserProfileDuplicates = httpsCallable(functions, "checkUserProfileDuplicates");
    const response = await checkUserProfileDuplicates({ uid, displayName, phoneNumber });
    return response.data;
  } catch (error) {
    console.error("Error checking user profile duplicates:", error);
    throw error;
  }
};

// Call getAllUsers Cloud Function
export const dogetAllUsers = async (signInUser: string, role: string, classId?: string) => {
  try {
    const getAllUsers = httpsCallable(functions, "getAllUsers");
    const response = await getAllUsers({ signInUser, role, classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const doCreateUser = async (
  signInUser: string,
  displayName: string,
  email: string,
  password: string,
  role: string,
  gradeLevels: string[] | null = null,
  gradeLevel: string | null = null,
) => {
  try {
    const createUser = httpsCallable(functions, "setCreateUser");
    const response = await createUser({
      signInUser,
      displayName,
      email,
      password,
      role,
      gradeLevels,
      gradeLevel,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Call setUserRole Cloud Function
export const doSetUserClaims = async (uid: string, role: string, gradeLevels: string[] | null = null, gradeLevel: string | null = null, classId: string | null = null) => {
  try {
    const setUserRole = httpsCallable(functions, "setUserClaims");
    const response = await setUserRole({ uid, role, gradeLevels, gradeLevel, classId });
    return response.data;
  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
};

export const doSetUserStatus = async (
  signInUser: string,
  uid: string,
  status: boolean,
) => {
  try {
    const setUserStatus = httpsCallable(functions, "setUserStatus");
    const response = await setUserStatus({ signInUser, uid, status });
    return response.data;
  } catch (error) {
    console.error("Error setting user status:", error);
    throw error;
  }
};

export const doUpdateUser = async (
  signInUser: string,
  uid: string,
  displayName: string,
  email: string,
  password: string,
  role: string,
  gradeLevels: string[] | null = null,
  gradeLevel: string | null = null,
) => {
  try {
    const setUpdateUser = httpsCallable(functions, "setUpdateUser");
    const response = await setUpdateUser({
      signInUser,
      uid,
      displayName,
      email,
      password,
      role,
      gradeLevels,
      gradeLevel,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Call deleteUser Cloud Function
export const doDeleteUser = async (signInUser: string, uid: string[]) => {
  try {
    const deleteUserFn = httpsCallable(functions, "setDeleteUser");
    const response = await deleteUserFn({ signInUser, uids: uid });
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Call getAdminStats Cloud Function
export const doGetAdminStats = async () => {
  try {
    const getAdminStatsFn = httpsCallable(functions, "getAdminStats");
    const response = await getAdminStatsFn();
    return response.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Call getTeacherStats Cloud Function
export const doGetTeacherStats = async (uid: string) => {
  try {
    const getTeacherStatsFn = httpsCallable(functions, "getTeacherStats");
    const response = await getTeacherStatsFn({ uid });
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    throw error;
  }
};

// Call getAllClassStudentStats Cloud Function
export const doGetAllClassStudentStats = async (uid: string) => {
  try {
    const getAllClassStudentStatsFn = httpsCallable(functions, "getAllClassStudentStats");
    const response = await getAllClassStudentStatsFn({ uid });
    return response.data;
  } catch (error) {
    console.error("Error fetching all class student stats:", error);
    throw error;
  }
};

// Call getStudentStats Cloud Function
export const doGetStudentStats = async (uid: string) => {
  try {
    const getStudentStatsFn = httpsCallable(functions, "getStudentStats");
    const response = await getStudentStatsFn({ uid });
    return response.data;
  } catch (error) {
    console.error("Error fetching student stats:", error);
    throw error;
  }
};

export const doGetClassNameById = async (classId: string) => {
  try {
    const getClassNameById = httpsCallable(functions, "getClassNameById");
    const response = await getClassNameById({ classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching class name by ID:", error);
    throw error;
  }
};

// Call getAllClasses Cloud Function
export const doGetAllClasses = async () => {
  try {
    const getAllClasses = httpsCallable(functions, "getAllClasses");
    const response = await getAllClasses();
    return response.data;
  } catch (error) {
    console.error("Error fetching all classes:", error);
    throw error;
  }
};

// Call getAllClasses Cloud Function
export const doGetAllTeacherClasses = async (uid: string) => {
  try {
    const getAllClasses = httpsCallable(functions, "getAllTeacherClasses");
    const response = await getAllClasses({ uid });
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

export const doCreateClass = async (
  signInUser: string,
  className: string,
  classDescription: string,
  gradeLevel: string,
  selectedDays: string[],
  time: string,
) => {
  try {
    const createClass = httpsCallable(functions, "setCreateClass");
    const response = await createClass({
      signInUser,
      className,
      classDescription,
      gradeLevel,
      days: selectedDays,
      time,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

export const doUpdateClass = async (
  signInUser: string,
  id: string,
  className: string,
  classDescription: string,
  gradeLevel: string,
  selectedDays: string[],
  time: string,
) => {
  try {
    const updateClass = httpsCallable(functions, "setUpdateClass");
    const response = await updateClass({
      signInUser,
      id,
      className,
      classDescription,
      gradeLevel,
      days: selectedDays,
      time,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

export const doDeleteClass = async (signInUser: string, id: string) => {
  try {
    const deleteClass = httpsCallable(functions, "setDeleteClass");
    const response = await deleteClass({ signInUser, id });
    return response.data;
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

export const doGetClassMembers = async (classId: string) => {
  try {
    const getClassMembers = httpsCallable(functions, "getClassMembers");
    const response = await getClassMembers({ classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching class members:", error);
    throw error;
  }
};

export const doJoinClassByCode = async (
  signInUser: string,
  classCode: string,
) => {
  try {
    const joinByClassCode = httpsCallable(functions, "setJoinClassByCode");
    const response = await joinByClassCode({ signInUser, classCode });
    return response.data;
  } catch (error) {
    console.error("Error joining class by code:", error);
    throw error;
  }
};

export const doGetAllClassMembersGrade = async (
  classId: string,
  gradeLevel: string,
) => {
  try {
    const getAllClassMembersGrade = httpsCallable(functions, "getAllClassMembersGrade");
    const response = await getAllClassMembersGrade({ classId, gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error fetching all class members grade:", error);
    throw error;
  }
};

export const doAddClassMember = async (
  signInUser: string,
  classId: string,
  gradeLevel: string,
  memberIds: string[],
  title: string,
) => {
  try {
    const addClassMember = httpsCallable(functions, "setAddClassMember");
    const response = await addClassMember({
      signInUser,
      classId,
      gradeLevel,
      memberIds,
      title,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding class member:", error);
    throw error;
  }
};

export const doUpdateClassMember = async (
  signInUser: string,
  classId: string,
  memberId: string,
  title: string,
) => {
  try {
    const updateClassMember = httpsCallable(functions, "setUpdateClassMember");
    const response = await updateClassMember({
      signInUser,
      classId,
      memberId,
      title,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating class member:", error);
    throw error;
  }
};

export const doDeleteClassMember = async (
  signInUser: string,
  classId: string,
  memberIds: string[],
) => {
  try {
    const deleteClassMember = httpsCallable(functions, "setDeleteClassMember");
    const response = await deleteClassMember({
      signInUser,
      classId,
      memberIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting class member:", error);
    throw error;
  }
};

export const doGetAllEvents = async (signInUser: string) => {
  try {
    const getAllEvents = httpsCallable(functions, "getAllEvents");
    const response = await getAllEvents({ signInUser });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const doCreateEvent = async (
  signInUser: string,
  selectedDate: string,
  time: string,
  eventname: string,
  eventdescription: string,
) => {
  try {
    const createEvent = httpsCallable(functions, "setCreateNewEvent");
    const response = await createEvent({
      signInUser,
      selectedDate,
      time,
      eventname,
      eventdescription,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const doUpdateEvent = async (
  signInUser: string,
  eventId: string,
  selectedDate: string,
  time: string,
  eventname: string,
  eventdescription: string,
) => {
  try {
    const updateEvent = httpsCallable(functions, "setUpdateEvent");
    const response = await updateEvent({
      signInUser,
      eventId,
      selectedDate,
      time,
      eventname,
      eventdescription,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const doDeleteEvent = async (signInUser: string, eventId: string) => {
  try {
    const deleteEvent = httpsCallable(functions, "setDeleteEvent");
    const response = await deleteEvent({ signInUser, eventId });
    return response.data;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const doGetAllYunits = async (classId: string) => {
  try {
    const getAllYunits = httpsCallable(functions, "getAllYunits");
    const response = await getAllYunits({ classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching yunits:", error);
    throw error;
  }
};

export const doCreateYunit = async (
  signInUser: string,
  status: boolean,
  yunitnumber: number,
  yunitname: string,
  imagepath: string,
  imageurl: string,
) => {
  try {
    const createYunit = httpsCallable(functions, "setCreateYunit");
    const response = await createYunit({
      signInUser,
      status,
      yunitnumber,
      yunitname,
      imagepath,
      imageurl,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating yunit:", error);
    throw error;
  }
};

export const doUnlockorLockYunitForClass = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  status: boolean,
) => {
  try {
    const unlockYunitForClass = httpsCallable(functions, "setUnlockorLockYunitForClass");
    const response = await unlockYunitForClass({ signInUser, classId, yunitId, status });
    return response.data;
  } catch (error) {
    console.error("Error unlocking yunit for class:", error);
    throw error;
  }
};

export const doUpdateYunit = async (
  signInUser: string,
  yunitId: string,
  yunitnumber: number,
  yunitname: string,
  imagepath: string,
  imageurl: string,
) => {
  try {
    const updateYunit = httpsCallable(functions, "setUpdateYunit");
    const response = await updateYunit({
      signInUser,
      id: yunitId,
      yunitnumber,
      yunitname,
      imagepath,
      imageurl,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating yunit:", error);
    throw error;
  }
};

export const doDeleteYunit = async (signInUser: string, yunitId: string) => {
  try {
    const deleteYunit = httpsCallable(functions, "setDeleteYunit");
    const response = await deleteYunit({ signInUser, id: yunitId });
    return response.data;
  } catch (error) {
    console.error("Error deleting yunit:", error);
    throw error;
  }
};

export const doGetUserOpenLessons = async (signInUser: string) => {
  try {
    const getUserOpenLessons = httpsCallable(functions, "getUserOpenLessons");
    const response = await getUserOpenLessons({ signInUser });
    return response.data;
  } catch (error) {
    console.error("Error fetching user open lessons:", error);
    throw error;
  }
};

export const doSetSaveLessonTimeSpent = async (
  signInUser: string,
  yunitId: string,
  lessonId: string,
  gradeLevel: string | null = null,
  timeSpent: number,
) => {
  try {
    const saveLessonTime = httpsCallable(functions, "setSaveLessonTimeSpent");
    const response = await saveLessonTime({
      signInUser,
      yunitId,
      lessonId,
      gradeLevel,
      timeSpent,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving lesson time spent:", error);
    throw error;
  }
};

export const doGetAllGradeLevelLessons = async (gradeLevel: string) => {
  try {
    const getAllGradeLevelLessons = httpsCallable(functions, "getAllGradeLevelLessons");
    const response = await getAllGradeLevelLessons({ gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error fetching all grade level lessons:", error);
    throw error;
  }
};

export const doGetAllDraftLessons = async () => {
  try {
    const getAllDraftLessons = httpsCallable(functions, "getAllDraftLessons");
    const response = await getAllDraftLessons();
    return response.data;
  } catch (error) {
    console.error("Error fetching all draft lessons:", error);
    throw error;
  }
};

export const doGetAllYunitLessons = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  gradeLevel: string,
) => {
  try {
    const getAllLessons = httpsCallable(functions, "getAllYunitLessons");
    const response = await getAllLessons({ signInUser, classId, yunitId, gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
};

export const doCreateLesson = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  yunitNumber: number,
  gradeLevel: string | null = null,
  isDraft: boolean,
  aralinNumero: string,
  aralinPamagat: string,
  aralinPaglalarawan: string | null = null,
  aralinLayunin: string[],
  fileUrls: any,
) => {
  try {
    const createLessonDraft = httpsCallable(functions, "setCreateLesson");
    const response = await createLessonDraft({
      signInUser,
      classId,
      yunitId,
      yunitNumber,
      gradeLevel,
      isDraft,
      aralinNumero,
      aralinPamagat,
      aralinPaglalarawan,
      aralinLayunin,
      fileUrls,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating lesson draft:", error);
    throw error;
  }
};

export const doUpdateLesson = async (
  signInUser: string,
  yunitId: string,
  lessonId: string,
  gradeLevel: string,
  aralinNumero: string,
  aralinPamagat: string,
  aralinPaglalarawan: string,
  aralinLayunin: string[],
  fileUrls: any,
) => {
  try {
    const updateLesson = httpsCallable(functions, "setUpdateLesson");
    const response = await updateLesson({
      signInUser,
      yunitId,
      lessonId,
      gradeLevel,
      aralinNumero,
      aralinPamagat,
      aralinPaglalarawan,
      aralinLayunin,
      fileUrls,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

export const doDeleteLesson = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  lessonId: string,
  gradeLevel: string,
) => {
  try {
    const deleteLesson = httpsCallable(functions, "setDeleteLesson");
    const response = await deleteLesson({
      signInUser,
      classId,
      yunitId,
      lessonId,
      gradeLevel,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

export const doArchiveorUnarchiveLesson = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  lessonId: string,
  gradeLevel: string,
  isArchived: boolean,
) => {
  try {
    const archiveLesson = httpsCallable(functions, "setArchiveorUnarchiveLesson");
    const response = await archiveLesson({
      signInUser,
      classId,
      yunitId,
      lessonId,
      gradeLevel,
      isArchived,
    });
    return response.data;
  } catch (error) {
    console.error("Error archiving lesson:", error);
    throw error;
  }
};

export const doGetAllSeatworks = async (
  signInUser: string,
  classId: string,
) => {
  try {
    const getAllSeatworks = httpsCallable(functions, "getAllSeatworks");
    const response = await getAllSeatworks({
      signInUser,
      classId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching seatworks:", error);
    throw error;
  }
};

export const doGetAllQuizzes = async (
  signInUser: string,
  classId: string,
) => {
  try {
    const getAllQuizzes = httpsCallable(functions, "getAllQuizzes");
    const response = await getAllQuizzes({
      signInUser,
      classId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
};

export const doCreateSeatworkorQuiz = async (
  signInUser: string,
  classId: string,
  yunitId: string,
  yunitNumber: string,
  lessonNumber: number,
  lessonId: string,
  gradeLevel: string | null = null,
  questions: any,
  category: string,
) => {
  try {
    const createQuiz = httpsCallable(functions, "setCreateSeatworkorQuiz");
    const response = await createQuiz({
      signInUser,
      classId,
      yunitId,
      yunitNumber,
      lessonNumber,
      lessonId,
      gradeLevel,
      questions,
      category,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

export const doSubmitSeatworkorQuizAnswers = async (
  signInUser: string,
  mode: string,
  category: string,
  classId: string | null = null,
  id: string,
  answers: any,
  score: number,
  totalScore: number,
  totalQuestions: number,
  gradeLevel: string,
) => {
  try {
    let response;
    if (mode === "seatwork") {
      const submitSeatworkAnswers = httpsCallable(functions, "submitSeatworkAnswers");
      response = await submitSeatworkAnswers({
        signInUser,
        category,
        classId,
        seatworkId: id,
        answers,
        score,
        totalSeatworkScore: totalScore,
        totalQuestions,
        gradeLevel,
      });
    } else {
      const submitQuizAnswers = httpsCallable(functions, "submitQuizAnswers");
      response = await submitQuizAnswers({
        signInUser,
        category,
        classId,
        quizId: id,
        answers,
        score,
        totalQuizScore: totalScore,
        totalQuestions,
        gradeLevel,
      });
    }
    return response.data;
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    throw error;
  }
};

export const doGetDescriptiveAnalytics = async () => {
  try {
    const getDecriptiveAnalytics = httpsCallable(functions, "getDescriptiveAnalytics");
    const response = await getDecriptiveAnalytics();
    return response.data;
  } catch (error) {
    console.error("Error fetching descriptive analytics:", error);
    throw error;
  }
};

export const doGetUserAnalytics = async (signInUser: string) => {
  try {
    const getUserAnalytics = httpsCallable(functions, "getUserAnalytics");
    const response = await getUserAnalytics({ signInUser });
    return response.data;
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    throw error;
  }
};

export const doGetAllVideos = async (
  lessonId: string,
  gradeLevel: string | null = null,
) => {
  try {
    const getAllVideos = httpsCallable(functions, "getAllVideos");
    const response = await getAllVideos({ lessonId, gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
};

export const doUploadVideo = async (
  signInUser: string,
  lessonId: string,
  gradeLevel: string | null = null,
  videoUrl: string,
  videoTitle: string,
  videoSize: number,
) => {
  try {
    const uploadVideo = httpsCallable(functions, "setUploadVideo");
    const response = await uploadVideo({
      signInUser,
      lessonId,
      gradeLevel,
      videoUrl,
      videoTitle,
      videoSize,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
};

export const doDeleteVideo = async (
  signInUser: string,
  gradeLevel: string | null = null,
  videoId: string,
) => {
  try {
    const deleteVideo = httpsCallable(functions, "setDeleteVideo");
    const response = await deleteVideo({ signInUser, gradeLevel, videoId });
    return response.data;
  } catch (error) {
    console.error("Error deleting video:", error);
    throw error;
  }
};

export const doGetAllAssignments = async (
  signInUser: string,
  classId: string,
) => {
  try {
    const getAllAssignments = httpsCallable(functions, "getAllAssignments");
    const response = await getAllAssignments({ signInUser, classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

export const doGetAllSubmissions = async (
  assignmentId: string,
  classId: string,
) => {
  try {
    const getAllSubmissions = httpsCallable(functions, "getAllAssignmentSubmissions");
    const response = await getAllSubmissions({ assignmentId, classId });
    return response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
};

export const doCreateAssignment = async (
  signInUser: string,
  classId: string,
  title: string,
  instructions: string,
  dueDate: string,
  totalPoints: number,
  attachments: string[] | null = null,
) => {
  try {
    const createAssignment = httpsCallable(functions, "setCreateAssignment");
    const response = await createAssignment({
      signInUser,
      classId,
      title,
      instructions,
      dueDate,
      totalPoints,
      attachments,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

export const doSubmitAssigment = async (
  signInUser: string,
  assignmentId: string,
  classId: string,
  attachments: string[] | null = null,
) => {
  try {
    const submitAssignment = httpsCallable(functions, "setSubmitAssignment");
    const response = await submitAssignment({
      signInUser,
      assignmentId,
      classId,
      attachments,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
};

export const doGetAllBigkasLevels = async (signInUser: string, gradeLevel: string | null = null) => {
  try {
    const getAllBigkasLevels = httpsCallable(functions, "getAllBigkasLevels");
    const response = await getAllBigkasLevels({ signInUser, gradeLevel });
    return response.data;
  } catch (error) {
    console.error("Error fetching bigkas levels:", error);
    throw error;
  }
};

export const doAddNewPhrases = async (
  signInUser: string,
  phrases: string[],
) => {
  try {
    const addNewPhrases = httpsCallable(functions, "setAddNewPhrases");
    const response = await addNewPhrases({
      signInUser,
      phrases,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting new level bigkas:", error);
    throw error;
  }
};

export const doSetStartPlayingBigkas = async (
  signInUser: string,
  bigkasId: string,
  levelNumber: string,
  mode: string,
) => {
  try {
    const startBigkas = httpsCallable(functions, "setStartPlayingBigkas");
    const response = await startBigkas({
      signInUser,
      bigkasId,
      levelNumber,
      mode,
    });
    return response.data;
  } catch (error) {
    console.error("Error starting bigkas:", error);
    throw error;
  }
};

export const doSetSaveProgressBigkas = async (
  signInUser: string,
  bigkasId: string,
  progressId: string,
  levelNumber: string,
  mode: string,
  phrases: string[],
  userTotalPoints: number,
  userTotalWords: number,
  totalWords: number,
) => {
  try {
    const saveProgress = httpsCallable(functions, "setSaveProgressBigkas");
    const response = await saveProgress({
      signInUser,
      bigkasId,
      progressId,
      levelNumber,
      mode,
      phrases,
      userTotalPoints,
      userTotalWords,
      totalWords,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving bigkas progress:", error);
    throw error;
  }
};
