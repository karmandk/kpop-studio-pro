import { useState, useCallback, useEffect } from "react";
import { Swords, Trophy, RotateCcw, Play } from "lucide-react";
import { getArtistThumbnail } from "../../lib/api";

interface BattlePageProps {
  groups: string[];
}

interface Match {
  a: string;
  b: string;
  winner?: string;
}

type Phase = "setup" | "battle" | "results";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBracket(groups: string[]): Match[] {
  const shuffled = shuffle(groups);
  const matches: Match[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push({ a: shuffled[i], b: shuffled[i + 1] });
    } else {
      matches.push({ a: shuffled[i], b: "", winner: shuffled[i] });
    }
  }
  return matches;
}

export default function BattlePage({ groups }: BattlePageProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [ranking, setRanking] = useState<string[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    groups.forEach((g) => {
      const stored = localStorage.getItem(`thumb_${g}`);
      if (stored) setThumbs((p) => ({ ...p, [g]: stored }));
      else {
        getArtistThumbnail(g).then((url) => {
          if (url) {
            localStorage.setItem(`thumb_${g}`, url);
            setThumbs((p) => ({ ...p, [g]: url }));
          }
        });
      }
    });
  }, [groups]);

  const startBattle = useCallback(() => {
    const bracket = createBracket(groups);
    setRounds([bracket]);
    setCurrentRound(0);
    setCurrentMatch(0);
    setRanking([]);
    setPhase("battle");
  }, [groups]);

  function pickWinner(winner: string) {
    const round = [...rounds[currentRound]];
    round[currentMatch] = { ...round[currentMatch], winner };
    const updatedRounds = [...rounds];
    updatedRounds[currentRound] = round;

    const nextMatchIdx = round.findIndex((m, i) => i > currentMatch && !m.winner);

    if (nextMatchIdx >= 0) {
      setRounds(updatedRounds);
      setCurrentMatch(nextMatchIdx);
      return;
    }

    const winners = round.map((m) => m.winner!);
    const losers = round.filter((m) => m.b !== "").map((m) => m.winner === m.a ? m.b : m.a);

    if (winners.length === 1) {
      setRounds(updatedRounds);
      setRanking([...winners, ...losers, ...ranking]);
      setPhase("results");
      return;
    }

    const nextBracket = createBracket(winners);
    setRounds([...updatedRounds, nextBracket]);
    setCurrentRound(currentRound + 1);
    setCurrentMatch(nextBracket.findIndex((m) => !m.winner) ?? 0);
    setRanking((prev) => [...prev, ...losers.reverse()]);
  }

  function reset() {
    setPhase("setup");
    setRounds([]);
    setRanking([]);
  }

  if (groups.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <Swords className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-semibold">Need at least 2 groups</p>
        <p className="text-sm mt-1">Add groups to your tier list first.</p>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Swords className="w-16 h-16 text-orange-400 opacity-60" />
        <div className="text-center">
          <h2 className="text-2xl font-black">Head-to-Head Battle</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {groups.length} groups will face off in a tournament bracket.
            <br />Pick your favorite in each matchup to determine the ultimate ranking!
          </p>
        </div>
        <button
          onClick={startBattle}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition-all"
        >
          <Play className="w-4 h-4" />
          Start Battle
        </button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-black">Battle Results</h2>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Battle Again
          </button>
        </div>
        <div className="space-y-2">
          {ranking.map((group, i) => (
            <div
              key={group}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-900/60 border border-white/10"
            >
              <span className={`text-lg font-black w-8 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-600"}`}>
                #{i + 1}
              </span>
              {thumbs[group] ? (
                <img src={thumbs[group]} alt={group} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-700 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400">
                  {group[0]}
                </div>
              )}
              <span className="font-bold">{group}</span>
              {i === 0 && <Trophy className="w-5 h-5 text-yellow-400 ml-auto" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Battle phase
  const round = rounds[currentRound];
  const match = round?.[currentMatch];
  if (!match) return null;

  const completedInRound = round.filter((m) => m.winner).length;
  const totalInRound = round.length;
  const totalRounds = Math.ceil(Math.log2(groups.length));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
            Round {currentRound + 1} of ~{totalRounds} · Match {completedInRound + 1}/{totalInRound}
          </p>
          <h2 className="text-xl font-black mt-1">Pick your favorite!</h2>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart
        </button>
      </div>

      <div className="flex items-center justify-center gap-8 py-12">
        <BattleCard
          name={match.a}
          thumb={thumbs[match.a]}
          onClick={() => pickWinner(match.a)}
        />
        <div className="text-3xl font-black text-gray-600">VS</div>
        <BattleCard
          name={match.b}
          thumb={thumbs[match.b]}
          onClick={() => pickWinner(match.b)}
        />
      </div>

      {/* Mini bracket progress */}
      <div className="flex flex-wrap gap-2 justify-center">
        {round.map((m, i) => (
          <div
            key={i}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${
              i === currentMatch
                ? "border-orange-500/50 bg-orange-500/10 text-orange-300"
                : m.winner
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-white/10 bg-white/5 text-gray-600"
            }`}
          >
            {m.winner ? m.winner : `${m.a.slice(0, 8)} vs ${m.b.slice(0, 8)}`}
          </div>
        ))}
      </div>
    </div>
  );
}

function BattleCard({ name, thumb, onClick }: { name: string; thumb?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-gray-900/60 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 hover:scale-105 transition-all w-56"
    >
      {thumb ? (
        <img src={thumb} alt={name} className="w-28 h-28 rounded-2xl object-cover border-2 border-white/15" />
      ) : (
        <div className="w-28 h-28 rounded-2xl bg-gray-700 border-2 border-white/15 flex items-center justify-center text-3xl font-bold text-gray-400">
          {name[0]}
        </div>
      )}
      <span className="text-lg font-bold text-center break-words w-full">{name}</span>
    </button>
  );
}
