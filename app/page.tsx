import AuthButtons from "@/components/AuthButtons";
import Dashboard from "@/components/Dashboard";
import AgentChat from "@/components/AgentChat";

export default function Page() {
  return (
    <div className="row">
      <div className="col-4">
        <div className="card">
          <h3>Accounts</h3>
          <AuthButtons />
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Agent</h3>
          <AgentChat />
        </div>
      </div>
      <div className="col-8">
        <div className="card">
          <h3>Overview</h3>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
