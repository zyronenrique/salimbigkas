const TeacherAssignmentsTab = ({ Tab }: { Tab: () => string }) => {
  return (
    <>
      {Tab() === "assignments" && (
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-gray-600">This is the assignments tab content.</p>
        </div>
      )}
    </>
  );
};

export default TeacherAssignmentsTab;
