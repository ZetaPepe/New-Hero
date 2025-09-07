"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface HeroXPresaleProps {
  walletAddress: string
  isConnecting: boolean
  walletError: string
  okbAmount: string
  isMinting: boolean
  setOkbAmount: (amount: string) => void
  setWalletError: (error: string) => void
  handleMint: () => void
  connectWallet: () => void
}

export default function HeroXPresale({
  walletAddress,
  isConnecting,
  walletError,
  okbAmount,
  isMinting,
  setOkbAmount,
  setWalletError,
  handleMint,
  connectWallet,
}: HeroXPresaleProps) {
  const { t } = useLanguage()

  // ======== 预售倒计时（北京时间 2025-09-07 15:00）========
  const targetTsRef = useRef<number>(
    new Date("2025-09-07T15:00:00+08:00").getTime()
  )
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0)

  const pad = (n: number) => n.toString().padStart(2, "0")
  const splitTime = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000))
    const days = Math.floor(total / 86400)
    const hours = Math.floor((total % 86400) / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60
    return { days, hours, minutes, seconds }
  }

  useEffect(() => {
    const tick = () => setTimeLeftMs(targetTsRef.current - Date.now())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const presaleStarted = timeLeftMs <= 0

  // ======== 本地提示框（不依赖 setWalletError）========
  const [notStartedOpen, setNotStartedOpen] = useState(false)
  useEffect(() => {
    if (!notStartedOpen) return
    const timer = setTimeout(() => setNotStartedOpen(false), 2500)
    return () => clearTimeout(timer)
  }, [notStartedOpen])

  // 点击逻辑：未连 -> 连接；已连但未开始 -> 本地弹框；开始 -> 真正 mint
  const onMintClick = () => {
    if (!walletAddress) {
      connectWallet()
      return
    }
    if (!presaleStarted) {
      setNotStartedOpen(true)
      return
    }
    if (typeof setWalletError === "function") setWalletError("") // 安全清理
    handleMint()
  }

  // 缩小版倒计时卡片
  const Unit = ({ value, label }: { value: string | number; label: string }) => (
    <div className="bg-white/90 rounded-lg px-3 py-2 shadow border border-orange-200/60 text-center">
      <div className="text-xl md:text-2xl font-extrabold text-orange-900">
        {value}
      </div>
      <div className="mt-1 text-xs md:text-sm tracking-wide text-orange-700">
        {label}
      </div>
    </div>
  )

  const { days, hours, minutes, seconds } = splitTime(timeLeftMs)

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          backgroundImage: "url('/images/herox-presale-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-transparent to-black/0 rounded-2xl"></div>

      <div className="relative rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-4 mb-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-800 via-red-700 to-orange-800 bg-clip-text text-transparent">
              {t("presaleTitle")}
            </h2>
          </div>
          <p className="text-orange-900/90 text-xl font-semibold">
            {t("presaleSubtitle")}
          </p>

          {/* 倒计时 */}
          <div className="mt-6">
            <p className="text-center text-orange-900 font-semibold text-lg md:text-xl">
              {t("presaleStartsIn") || "Presale starts in:"}
            </p>

            {presaleStarted ? (
              <div className="mt-3 text-center text-green-700 font-bold text-xl">
                {t("presaleStarted") || "Started"}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto">
                <Unit value={days} label={t("days") || "Days"} />
                <Unit value={pad(hours)} label={t("hours") || "Hours"} />
                <Unit value={pad(minutes)} label={t("minutes") || "Minutes"} />
                <Unit value={pad(seconds)} label={t("seconds") || "Seconds"} />
              </div>
            )}
          </div>
        </div>

        {/* Presale interface */}
        <div className="max-w-md mx-auto">
          <div className="bg-white/95 rounded-xl p-6 shadow-lg border border-orange-200/50 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-orange-800 mb-3">
                  {t("okbAmount")}
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={okbAmount}
                  onChange={(e) => setOkbAmount(e.target.value)}
                  disabled={!walletAddress}
                  className="w-full px-4 py-3 text-xl font-mono text-center border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="1.0"
                />
              </div>
              <div className="flex justify-between text-sm text-orange-600 font-medium">
                <span>{t("minimumOkb")}</span>
                <span>{t("maximumOkb")}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onMintClick}
            disabled={isMinting || (!walletAddress && isConnecting)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isMinting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("minting")}</span>
              </div>
            ) : walletAddress ? (
              <div className="flex items-center justify-center space-x-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
                <span>{t("mint")}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
                <span>{t("connectWalletFirst")}</span>
              </div>
            )}
          </Button>

          {/* 其他错误仍可用外部 walletError 展示（如果你需要） */}
          {walletError && (
            <p className="text-center text-red-600 text-sm mt-3 bg-red-50/70 rounded-md px-3 py-2">
              {walletError}
            </p>
          )}
        </div>
      </div>

      {/* ======== 预售未开始：本地 Toast/弹框 ======== */}
      {notStartedOpen && (
        <div
          role="dialog"
          aria-live="assertive"
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50"
        >
          <div className="bg-orange-600 text-white rounded-lg shadow-lg px-4 py-3 text-sm md:text-base">
            {t("presaleNotStarted") || "Presale has not started yet."}
          </div>
        </div>
      )}
    </div>
  )
}
