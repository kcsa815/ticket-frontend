// import React, { useState, useRef, useEffect } from 'react';
// import { Download, Upload, Plus, Trash2, Save, Grid, MousePointer } from 'lucide-react';

// const SeatLayoutEditor = () => {
//   const [seats, setSeats] = useState([]);
//   const [backgroundImage, setBackgroundImage] = useState(null);
//   const [selectedGrade, setSelectedGrade] = useState('VIP');
//   const [mode, setMode] = useState('add'); // 'add' or 'delete'
//   const [selectedSeat, setSelectedSeat] = useState(null);
//   const [scale, setScale] = useState(1);
//   const [seatCounter, setSeatCounter] = useState(1);
//   const [seatSize, setSeatSize] = useState(32); // 좌석 크기 조절 (기본 32px)
//   const canvasRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const grades = [
//     { name: 'VIP', color: '#FF6B6B', price: 150000 },
//     { name: 'R', color: '#4ECDC4', price: 120000 },
//     { name: 'S', color: '#45B7D1', price: 90000 },
//     { name: 'A', color: '#96CEB4', price: 60000 },
//   ];

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setBackgroundImage(event.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleCanvasClick = (e) => {
//     if (!canvasRef.current) return;

//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = (e.clientX - rect.left) / scale;
//     const y = (e.clientY - rect.top) / scale;

//     if (mode === 'add') {
//       const newSeat = {
//         id: Date.now(),
//         seatNumber: seatCounter,
//         x: x,
//         y: y,
//         grade: selectedGrade,
//         color: grades.find(g => g.name === selectedGrade).color,
//       };
//       setSeats([...seats, newSeat]);
//       setSeatCounter(seatCounter + 1);
//     } else if (mode === 'delete') {
//       const clickedSeat = seats.find(seat => {
//         const distance = Math.sqrt(Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2));
//         return distance < 15;
//       });
//       if (clickedSeat) {
//         setSeats(seats.filter(s => s.id !== clickedSeat.id));
//       }
//     }
//   };

//   const handleSeatClick = (seat, e) => {
//     e.stopPropagation();
//     setSelectedSeat(seat);
//   };

//   const updateSeatGrade = (seatId, newGrade) => {
//     setSeats(seats.map(seat => 
//       seat.id === seatId 
//         ? { ...seat, grade: newGrade, color: grades.find(g => g.name === newGrade).color }
//         : seat
//     ));
//   };

//   const exportData = () => {
//     const data = {
//       seats: seats.map(({ id, ...rest }) => rest),
//       backgroundImage: backgroundImage,
//       timestamp: new Date().toISOString(),
//     };
//     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `seat-layout-${Date.now()}.json`;
//     a.click();
//   };

//   const importData = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const data = JSON.parse(event.target.result);
//           setSeats(data.seats.map(seat => ({ ...seat, id: Date.now() + Math.random() })));
//           setBackgroundImage(data.backgroundImage);
//           setSeatCounter(Math.max(...data.seats.map(s => s.seatNumber), 0) + 1);
//         } catch (error) {
//           alert('파일을 불러오는데 실패했습니다.');
//         }
//       };
//       reader.readAsText(file);
//     }
//   };

//   const clearAll = () => {
//     if (window.confirm('모든 좌석을 삭제하시겠습니까?')) {
//       setSeats([]);
//       setSeatCounter(1);
//     }
//   };

//   return (
//     <div className="w-full h-screen bg-gray-900 flex flex-col">
//       {/* 상단 툴바 */}
//       <div className="bg-gray-800 p-4 border-b border-gray-700">
//         <div className="flex items-center justify-between gap-4 flex-wrap">
//           {/* 좌측: 이미지 업로드 */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
//             >
//               <Upload size={18} />
//               배치도 이미지 업로드
//             </button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleImageUpload}
//               className="hidden"
//             />
//           </div>

//           {/* 중앙: 모드 선택 */}
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => setMode('add')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                 mode === 'add' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//               }`}
//             >
//               <Plus size={18} />
//               좌석 추가
//             </button>
//             <button
//               onClick={() => setMode('delete')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                 mode === 'delete' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//               }`}
//             >
//               <Trash2 size={18} />
//               좌석 삭제
//             </button>
//           </div>

//           {/* 우측: 저장/불러오기 */}
//           <div className="flex items-center gap-2">
//             <input
//               type="file"
//               accept=".json"
//               onChange={importData}
//               className="hidden"
//               id="import-file"
//             />
//             <label
//               htmlFor="import-file"
//               className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer transition"
//             >
//               <Upload size={18} />
//               불러오기
//             </label>
//             <button
//               onClick={exportData}
//               className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
//             >
//               <Download size={18} />
//               내보내기
//             </button>
//             <button
//               onClick={clearAll}
//               className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
//             >
//               <Trash2 size={18} />
//               전체 삭제
//             </button>
//           </div>
//         </div>

//         {/* 좌석 등급 선택 */}
//         {mode === 'add' && (
//           <div className="flex items-center gap-2 mt-4">
//             <span className="text-gray-300 font-medium">좌석 등급:</span>
//             {grades.map(grade => (
//               <button
//                 key={grade.name}
//                 onClick={() => setSelectedGrade(grade.name)}
//                 className={`px-4 py-2 rounded-lg transition ${
//                   selectedGrade === grade.name
//                     ? 'ring-2 ring-white'
//                     : 'opacity-70 hover:opacity-100'
//                 }`}
//                 style={{ backgroundColor: grade.color, color: 'white' }}
//               >
//                 {grade.name} ({grade.price.toLocaleString()}원)
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* 메인 캔버스 영역 */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* 캔버스 */}
//         <div className="flex-1 overflow-auto bg-gray-950 p-8">
//           <div
//             ref={canvasRef}
//             onClick={handleCanvasClick}
//             className="relative inline-block cursor-crosshair"
//             style={{
//               minWidth: '800px',
//               minHeight: '600px',
//               transform: `scale(${scale})`,
//               transformOrigin: 'top left',
//             }}
//           >
//             {/* 배경 이미지 */}
//             {backgroundImage && (
//               <img
//                 src={backgroundImage}
//                 alt="Seat Layout"
//                 className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none opacity-60"
//                 style={{ minWidth: '800px', minHeight: '600px' }}
//               />
//             )}

//             {/* 안내 메시지 */}
//             {!backgroundImage && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="text-center text-gray-500">
//                   <Grid size={64} className="mx-auto mb-4" />
//                   <p className="text-lg">배치도 이미지를 업로드하세요</p>
//                 </div>
//               </div>
//             )}

//             {/* 좌석들 */}
//             {seats.map(seat => (
//               <div
//                 key={seat.id}
//                 onClick={(e) => handleSeatClick(seat, e)}
//                 className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition"
//                 style={{
//                   left: `${seat.x}px`,
//                   top: `${seat.y}px`,
//                 }}
//               >
//                 <div
//                   className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
//                   style={{ backgroundColor: seat.color }}
//                 >
//                   {seat.seatNumber}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 우측 사이드바 */}
//         <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-auto">
//           <div className="p-4">
//             {/* 줌 컨트롤 */}
//             <div className="mb-6">
//               <h3 className="text-white font-semibold mb-2">화면 배율</h3>
//               <input
//                 type="range"
//                 min="0.5"
//                 max="2"
//                 step="0.1"
//                 value={scale}
//                 onChange={(e) => setScale(parseFloat(e.target.value))}
//                 className="w-full"
//               />
//               <div className="text-center text-gray-400 text-sm mt-1">{(scale * 100).toFixed(0)}%</div>
//             </div>

//             {/* 통계 */}
//             <div className="mb-6">
//               <h3 className="text-white font-semibold mb-3">좌석 통계</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between text-gray-300">
//                   <span>총 좌석:</span>
//                   <span className="font-bold">{seats.length}석</span>
//                 </div>
//                 {grades.map(grade => {
//                   const count = seats.filter(s => s.grade === grade.name).length;
//                   return (
//                     <div key={grade.name} className="flex justify-between text-gray-300">
//                       <span style={{ color: grade.color }}>{grade.name}석:</span>
//                       <span className="font-bold">{count}석</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* 선택된 좌석 정보 */}
//             {selectedSeat && (
//               <div className="mb-6 p-4 bg-gray-700 rounded-lg">
//                 <h3 className="text-white font-semibold mb-3">선택된 좌석</h3>
//                 <div className="space-y-2 text-gray-300">
//                   <div>좌석 번호: <span className="font-bold">{selectedSeat.seatNumber}</span></div>
//                   <div>현재 등급: <span className="font-bold" style={{ color: selectedSeat.color }}>{selectedSeat.grade}</span></div>
//                   <div className="pt-2">
//                     <label className="block text-sm mb-2">등급 변경:</label>
//                     <select
//                       value={selectedSeat.grade}
//                       onChange={(e) => updateSeatGrade(selectedSeat.id, e.target.value)}
//                       className="w-full px-3 py-2 bg-gray-600 text-white rounded"
//                     >
//                       {grades.map(grade => (
//                         <option key={grade.name} value={grade.name}>
//                           {grade.name} - {grade.price.toLocaleString()}원
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* 사용 방법 */}
//             <div className="p-4 bg-gray-700 rounded-lg">
//               <h3 className="text-white font-semibold mb-2">사용 방법</h3>
//               <ul className="text-gray-300 text-sm space-y-2">
//                 <li>1. 배치도 이미지 업로드</li>
//                 <li>2. 좌석 등급 선택</li>
//                 <li>3. 캔버스 클릭으로 좌석 추가</li>
//                 <li>4. 좌석 클릭으로 등급 변경</li>
//                 <li>5. 완료 후 JSON 내보내기</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SeatLayoutEditor;