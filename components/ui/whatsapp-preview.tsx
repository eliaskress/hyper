"use client";

export function WhatsAppPreview({
  messages,
}: {
  messages: { from: "hyper" | "user"; text: string; time?: string }[];
}) {
  return (
    <div className="bg-[#e5ddd5] rounded-xl p-3 space-y-2 max-w-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-[#d1c9be]">
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700">Hyper</span>
      </div>
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.from === "user"
                ? "bg-[#dcf8c6] text-gray-800"
                : "bg-white text-gray-800"
            }`}
          >
            <p className="whitespace-pre-line">{msg.text}</p>
            {msg.time && (
              <p className="text-[10px] text-gray-500 text-right mt-0.5">{msg.time}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WhatsAppIndicator({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${connected ? "bg-[#25D366]" : "bg-gray-300"}`} />
      <span className={connected ? "text-gray-700" : "text-gray-400"}>
        {connected ? "Connected via WhatsApp" : "WhatsApp not connected"}
      </span>
    </div>
  );
}
