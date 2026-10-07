"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { HealthResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import {
  Server,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  Code,
  Globe,
} from "lucide-react";

export default function HomePage() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>("");
  const [sampleInput, setSampleInput] = useState<string>("");
  const { showToast } = useToast();

  const checkBackendHealth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.health.check();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
      showToast("Backend connection verified successfully!", "success");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect to backend";
      setError(msg);
      showToast(`Connection failed: ${msg}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <span className="font-black text-xl tracking-tighter">ab</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Airbnb Fullstack Marketplace
              </h1>
              <p className="text-sm text-slate-500">
                Project Foundation & Health Verification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                healthData
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : error
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  healthData
                    ? "bg-emerald-500 animate-pulse"
                    : error
                    ? "bg-rose-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              {healthData ? "API Connected" : error ? "API Offline" : "Connecting..."}
            </span>
          </div>
        </header>

        {/* Section 1: Backend Communication Proof */}
        <section>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-rose-500" />
                  Backend Health Check (GET /api/health)
                </CardTitle>
                <CardDescription>
                  Verifies full-stack communication between Next.js (port 3000) and FastAPI (port 8000).
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkBackendHealth}
                isLoading={isLoading}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Ping API
              </Button>
            </CardHeader>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-sm overflow-x-auto">
              {isLoading && !healthData ? (
                <div className="flex items-center gap-3 py-2 text-slate-400">
                  <Spinner size="sm" />
                  <span>Requesting /api/health from FastAPI backend...</span>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 py-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Connection Error:</p>
                    <p className="text-xs text-rose-300 mt-1">{error}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Make sure the backend is running at{" "}
                      <code>http://localhost:8000</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span>Status Code: 200 OK</span>
                    {lastChecked && <span>Last checked: {lastChecked}</span>}
                  </div>
                  <pre className="text-emerald-400 text-xs">
                    {JSON.stringify(healthData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </section>

        {/* Section 2: Architecture Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Frontend</h3>
            <p className="text-xs text-slate-500 mt-1">
              Next.js 16 App Router, TypeScript, Tailwind CSS, Centralized API Client.
            </p>
          </Card>

          <Card className="p-5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Backend</h3>
            <p className="text-xs text-slate-500 mt-1">
              Python FastAPI, SQLAlchemy 2.0, SQLite Database, Pydantic v2 schemas.
            </p>
          </Card>

          <Card className="p-5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Architecture</h3>
            <p className="text-xs text-slate-500 mt-1">
              Strict separation: Routers ➔ Services ➔ Schemas / Models. Centralized error handling.
            </p>
          </Card>
        </section>

        {/* Section 3: UI Primitives & Foundation Demo */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-700" />
                Reusable UI Primitives & Notification Foundation
              </CardTitle>
              <CardDescription>
                Test common buttons, inputs, loading states, and toasts.
              </CardDescription>
            </CardHeader>

            <div className="space-y-6">
              {/* Buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Buttons
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">
                    Primary Button
                  </Button>
                  <Button variant="secondary" size="sm">
                    Secondary
                  </Button>
                  <Button variant="outline" size="sm">
                    Outline
                  </Button>
                  <Button variant="ghost" size="sm">
                    Ghost
                  </Button>
                  <Button variant="danger" size="sm">
                    Danger
                  </Button>
                  <Button variant="primary" size="sm" isLoading>
                    Loading
                  </Button>
                </div>
              </div>

              {/* Toast Triggers */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Toast Notifications
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      showToast("Action completed successfully!", "success")
                    }
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                    Success Toast
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      showToast("Something went wrong with the request.", "error")
                    }
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                    Error Toast
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      showToast("Here is a quick information update.", "info")
                    }
                  >
                    <Bell className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                    Info Toast
                  </Button>
                </div>
              </div>

              {/* Input Primitive */}
              <div className="max-w-md">
                <Input
                  label="Sample Input Primitive"
                  placeholder="Type anything to test input binding..."
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                />
                {sampleInput && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Value: <span className="font-semibold">{sampleInput}</span>
                  </p>
                )}
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
