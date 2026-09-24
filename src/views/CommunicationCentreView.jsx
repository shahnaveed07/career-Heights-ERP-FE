import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Bell,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useErpData } from '../context/ErpDataContext';
import { useAuth } from '../context/AuthContext';
export const CommunicationCentreView = () => {
  const {
    notifications,
    scopedCommunications,
    sendBroadcastMessage,
    batches,
    scopedBatches,
    students,
    scopedStudents,
  } = useErpData();
  const { can, uiMode, activeBranchFilter } = useAuth();
  const canSendBroadcast = uiMode !== 'view' && can('communication', 'add');
  const [activeTab, setActiveTab] = useState('broadcast');
  const [channel, setChannel] = useState('sms');
  const [targetAudience, setTargetAudience] = useState('all_parents');
  const [templateName, setTemplateName] = useState('attendance_alert');
  const [messageContent, setMessageContent] = useState(
    'Dear Parent, Your ward was marked PRESENT at Career Heights for the 08:30 AM Physics Lecture. \u2014 Principal CH'
  );
  const [broadcastHistory, setBroadcastHistory] = useState([
    {
      id: 'b-1',
      channel: 'sms',
      target: 'All Enrolled Parents',
      message:
        'Monthly Parent-Teacher Mentoring Meet is scheduled for Sunday 10:00 AM at Handwara Main Auditorium.',
      template: 'parent_meeting',
      timestamp: '2026-09-18 09:30 AM',
      recipientsCount: 420,
      deliveryRate: '99.2%',
    },
    {
      id: 'b-2',
      channel: 'whatsapp',
      target: 'NEET Dropper 2026 Batch',
      message:
        'Full Mock Test Phase 1 OMR ranks have been published on your student portal. Review answer keys now.',
      template: 'test_announcement',
      timestamp: '2026-09-15 05:00 PM',
      recipientsCount: 88,
      deliveryRate: '100%',
    },
  ]);
  const [broadcastSentNotification, setBroadcastSentNotification] =
    useState(null);
  const handleTemplateChange = (tpl) => {
    setTemplateName(tpl);
    if (tpl === 'attendance_alert') {
      setMessageContent(
        'Dear Parent, Your ward was marked PRESENT at Career Heights Handwara Campus for the 08:30 AM Lecture. \u2014 Principal CH'
      );
    } else if (tpl === 'fee_reminder') {
      setMessageContent(
        'Dear Parent, Tuition fee installment of \u20B925,000 is due on 15 Oct 2026. Avoid late fees by paying online. \u2014 Accounts Desk CH'
      );
    } else if (tpl === 'exam_results') {
      setMessageContent(
        'Dear Student, OMR answer keys for Diagnostic Mock Test #3 have been processed. Check your All-India percentile rank in the portal.'
      );
    } else {
      setMessageContent(
        'Important institutional notification from Career Heights Executive Directorate.'
      );
    }
  };
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendBroadcastMessage({
      channel,
      target: targetAudience,
      message: messageContent,
      template: templateName,
    });
    const newRecord = {
      id: `b-${Date.now()}`,
      channel,
      target:
        targetAudience === 'all_parents'
          ? 'All Enrolled Parents'
          : 'Target Student Batches',
      message: messageContent,
      template: templateName,
      timestamp: 'Just now',
      recipientsCount: targetAudience === 'all_parents' ? scopedStudents.length : Math.min(45, scopedStudents.length),
      deliveryRate: '100% (Queued)',
    };
    setBroadcastHistory([newRecord, ...broadcastHistory]);
    setBroadcastSentNotification(
      `Broadcast successfully queued across official SMS Gateway & WhatsApp API for delivery.`
    );
    setTimeout(() => setBroadcastSentNotification(null), 4e3);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Omnichannel Messaging
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Communication Centre &amp; Broadcast Hub
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Automated SMS gate triggers, WhatsApp notifications, parent alerts,
            and circulars.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'broadcast' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Compose Broadcast
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`rounded px-3 py-1.5 text-xs font-bold transition ${activeTab === 'logs' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Delivery Audit Logs
          </button>
        </div>
      </div>

      {/* Demo Simulation Badge */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            Simulation Mode
          </span>
          <span className="font-medium">
            Outbound SMS &amp; WhatsApp gateway dispatch is simulated locally
            for client demo.
          </span>
        </div>
        <span className="text-[11px] text-blue-700 font-semibold">
          No external carrier charges incurred
        </span>
      </div>

      {broadcastSentNotification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{broadcastSentNotification}</span>
        </div>
      )}

      {/* COMPOSE BROADCAST TAB */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-900" />
              <span>Dispatch Mass Broadcast Notification</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              {/* Delivery Channels */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`rounded-xl border p-3 flex items-center justify-center gap-2 font-bold text-xs transition ${channel === 'sms' ? 'border-blue-900 bg-blue-50/50 text-blue-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'}`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>DLT SMS Gateway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`rounded-xl border p-3 flex items-center justify-center gap-2 font-bold text-xs transition ${channel === 'whatsapp' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Business</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel('push')}
                    className={`rounded-xl border p-3 flex items-center justify-center gap-2 font-bold text-xs transition ${channel === 'push' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs' : 'border-slate-200 bg-white text-slate-700'}`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>In-App Mobile Push</span>
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="all_parents">
                      All Enrolled Parents ({students.length})
                    </option>
                    <option value="all_students">
                      All Active Students ({students.length})
                    </option>
                    <option value="faculty">All Teaching Faculty</option>
                    <option value="overdue_parents">
                      Parents with Overdue Fees
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pre-Approved DLT Template
                  </label>
                  <select
                    value={templateName}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="attendance_alert">
                      Daily Attendance Check-in
                    </option>
                    <option value="fee_reminder">
                      Due Fee Payment Reminder
                    </option>
                    <option value="exam_results">OMR Rank Publication</option>
                    <option value="custom">
                      General Administrative Circular
                    </option>
                  </select>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">
                    Message Text
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {messageContent.length} chars (1 SMS credit)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                {canSendBroadcast ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 shadow-md transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Dispatch Broadcast Message</span>
                  </button>
                ) : (
                  <span className="rounded-lg bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500">
                    Broadcast Dispatch Locked (View Only)
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right Mobile Screen Simulator Preview */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center">
            <span className="text-xs font-bold text-slate-600 mb-3">
              Parent Handset Live Preview
            </span>

            {/* Mobile Mockup Frame */}
            <div className="w-64 rounded-3xl border-4 border-slate-800 bg-slate-900 p-2 shadow-xl">
              <div className="h-4 w-20 bg-slate-800 rounded-full mx-auto mb-2" />
              <div className="rounded-2xl bg-slate-100 p-3 min-h-[300px] flex flex-col justify-between text-[11px]">
                <div className="space-y-2">
                  <div className="text-center text-[10px] text-slate-400 font-semibold">
                    Today • Carrier SMS
                  </div>
                  <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs border border-slate-200 text-slate-800 leading-snug">
                    <p className="font-bold text-blue-900 text-[10px] mb-1">
                      CAREER HEIGHTS HQ
                    </p>
                    <p>{messageContent}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block text-right">
                      09:42 AM • Delivered
                    </span>
                  </div>
                </div>

                <div className="text-center text-[9px] text-slate-400">
                  Secured by Career Heights DLT Header:{' '}
                  <strong className="text-slate-600">CRHTS-J&amp;K</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Broadcast Dispatch Ledger &amp; Delivery Receipts
            </h3>
            <p className="text-xs text-slate-500">
              Telecom delivery status acknowledgments from SMS and WhatsApp
              providers.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {broadcastHistory.map((b) => (
              <div
                key={b.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {b.target}
                    </span>
                    <span className="rounded bg-blue-50 text-blue-900 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {b.channel}
                    </span>
                    <span className="text-slate-400">• {b.timestamp}</span>
                  </div>
                  <p className="text-slate-600 italic">"{b.message}"</p>
                  <p className="text-[11px] text-slate-400">
                    Template ID: {b.template} • Recipients: {b.recipientsCount}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {b.deliveryRate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
