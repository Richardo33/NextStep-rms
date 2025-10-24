export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Overview</h3>
      <p className="text-gray-600">
        Lihat sekilas progress rekrutmen, job yang aktif, dan kandidat terbaru.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800">Active Jobs</h4>
          <p className="text-2xl font-bold text-indigo-600 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800">Total Candidates</h4>
          <p className="text-2xl font-bold text-indigo-600 mt-2">32</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="font-semibold text-gray-800">Pending Interviews</h4>
          <p className="text-2xl font-bold text-indigo-600 mt-2">4</p>
        </div>
      </div>
    </div>
  );
}
