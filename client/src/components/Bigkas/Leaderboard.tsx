import { useState, useEffect, memo } from 'react';
import { database, dbRef, onValue, off } from '../../firebase/firebase';
import { imageSrc } from '../Icons/icons';
import { useAuth } from '../../hooks/authContext';
import { useBigkasContext } from '../../hooks/bigkasContext';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  gradeLevel: string | null;
  levelNumber: number;
  mode: string;
  totalScore: number;
  totalWords: number;
  correctWords: number;
  accuracy: number;
  completedAt: number;
  timestamp: number;
}

const Leaderboard = memo(() => {
  const { bigkasResults } = useBigkasContext();
  const { currentUser, setLoading: setIsLoading } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leaderboardRef = dbRef(database, `leaderboard/bigkas/${bigkasResults?.bigkasId}/${bigkasResults?.mode}`);
    setIsLoading(true);
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entriesArray = Object.values(data) as LeaderboardEntry[];
        let filteredEntries = entriesArray;
        filteredEntries.sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }
          if (b.accuracy !== a.accuracy) {
            return b.accuracy - a.accuracy;
          }
          return a.completedAt - b.completedAt;
        });
        setEntries(filteredEntries);
      } else {
        setEntries([]);
      }
      setLoading(false);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
      setIsLoading(false);
    });
    return () => {
      off(leaderboardRef, 'value', unsubscribe);
      setIsLoading(false);
    };
  }, [bigkasResults?.bigkasId, bigkasResults?.levelNumber, bigkasResults?.mode]);

  const userRank = entries.findIndex(e => e.uid === currentUser?.uid) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return imageSrc.trophy1;
      case 2: return imageSrc.trophy2;
      case 3: return imageSrc.trophy3;
      default: return `#${rank}`;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#2C3E50] rounded-4xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className='flex items-center space-x-1'>
          <h2 className="text-2xl font-bold text-white">
            {userRank > 0 && <>You're in <span className="text-yellow-400">{userRank}{userRank === 1 ? 'st' : userRank === 2 ? 'nd' : userRank === 3 ? 'rd' : 'th'} place</span></>}
          </h2>
        </div>
        <div className="flex space-x-2">
          {bigkasResults?.levelNumber && bigkasResults?.mode && (
            <h2 className="text-2xl text-white font-bold">Level <span className="text-yellow-400">{bigkasResults.levelNumber}</span> ~ <span className="text-yellow-400">{bigkasResults.mode}</span></h2>
          )}
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="chalk-text text-center text-3xl py-8">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-3">
          {entries.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.uid}
              className={`flex items-center justify-between px-4 py-2 rounded-2xl transition-all duration-200 ${
                entry.uid === currentUser?.uid
                  ? ' border-4 border-[#FFA600] bg-yellow-50 shadow-md'
                  : ' border-2 border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold w-12 text-center">
                  {index + 1 <= 3 ? (
                    <img
                      src={getRankIcon(index + 1)}
                      alt={`Rank ${index + 1}`}
                      className="size-14"
                    />
                  ) : (
                    <span>#{index + 1}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {entry.photoURL ? (
                    <img
                      src={entry.photoURL}
                      alt={entry.displayName}
                      className="w-10 h-10 rounded-full object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2C3E50] flex items-center justify-center">
                      <span className="text-[#fff] font-bold">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className='flex flex-col text-left'>
                    <p className="text-xl font-bold text-gray-800 items-center flex">
                      {entry.displayName}
                      {entry.uid === currentUser?.uid && (
                        <span className="ml-2 text-xs bg-[#2C3E50] text-white px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-sm font-semibold text-gray-500">
                      Level {entry.levelNumber} • {entry.mode} • {formatTime(entry.completedAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#2C3E50]">
                  {entry.totalScore} pts
                </p>
                <p className="text-sm font-semibold text-gray-500">
                  {entry.accuracy}% accuracy
                </p>
                <p className="text-xs font-semibold text-gray-400">
                  {entry.correctWords}/{entry.totalWords} words
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Leaderboard;
