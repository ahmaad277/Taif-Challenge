/* Trivia categories and question bank */

const TC = window.DESIGN_COLORS || {
  surfaceCard: '#2a1848',
  accent: '#e84393',
  gold: '#f0c75e',
  blue: '#6c8cff',
  success: '#5cdb95',
  textSecondary: '#c4b8d9',
  orange: '#ffb86c',
  purple: '#b388ff'
};

function drawTriviaCategoryBackground(ctx, size) {
  if (typeof drawThumbBackground === 'function') {
    drawThumbBackground(ctx, size);
    return;
  }
  ctx.fillStyle = TC.surfaceCard;
  ctx.fillRect(0, 0, size, size);
}

function drawHistoryGeoThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.blue;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.48, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TC.success;
  ctx.beginPath();
  ctx.ellipse(size * 0.38, size * 0.42, size * 0.12, size * 0.08, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.58, size * 0.52, size * 0.1, size * 0.07, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawScienceThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.strokeStyle = TC.success;
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size * 0.72);
  ctx.lineTo(size * 0.5, size * 0.28);
  ctx.lineTo(size * 0.65, size * 0.72);
  ctx.stroke();
  ctx.fillStyle = TC.accent;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.28, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawTechThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.textSecondary;
  ctx.fillRect(size * 0.22, size * 0.3, size * 0.56, size * 0.36);
  ctx.fillStyle = TC.blue;
  ctx.fillRect(size * 0.28, size * 0.36, size * 0.44, size * 0.24);
  ctx.fillStyle = TC.surfaceCard;
  ctx.fillRect(size * 0.38, size * 0.66, size * 0.24, size * 0.06);
}

function drawSportsThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.strokeStyle = TC.gold;
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.5, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.5, size * 0.28);
  ctx.lineTo(size * 0.5, size * 0.72);
  ctx.moveTo(size * 0.28, size * 0.5);
  ctx.lineTo(size * 0.72, size * 0.5);
  ctx.stroke();
}

function drawSpaceThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.gold;
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.38, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TC.accent;
  ctx.beginPath();
  ctx.arc(size * 0.58, size * 0.55, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TC.textSecondary;
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(size * (0.2 + i * 0.14), size * 0.78, 2, 2);
  }
}

function drawAnimalsThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.orange;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.52, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TC.surfaceCard;
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.38, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.62, size * 0.38, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawLanguagesThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.purple;
  ctx.font = `bold ${size * 0.32}px "Tajawal", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('أ', size * 0.35, size * 0.42);
  ctx.fillStyle = TC.blue;
  ctx.fillText('B', size * 0.65, size * 0.58);
}

function drawPuzzlesThumb(ctx, size) {
  drawTriviaCategoryBackground(ctx, size);
  ctx.fillStyle = TC.accent;
  ctx.font = `bold ${size * 0.4}px "Tajawal", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', size * 0.5, size * 0.52);
}

const TRIVIA_CATEGORIES = [
  { id: 'historyGeo', name: 'التاريخ والجغرافيا', drawThumb: drawHistoryGeoThumb, enabled: true },
  { id: 'science', name: 'العلوم والطبيعة', drawThumb: drawScienceThumb, enabled: true },
  { id: 'technology', name: 'التكنولوجيا', drawThumb: drawTechThumb, enabled: true },
  { id: 'sports', name: 'الرياضة المحلية', drawThumb: drawSportsThumb, enabled: true },
  { id: 'space', name: 'الفضاء والكون', drawThumb: drawSpaceThumb, enabled: true },
  { id: 'animals', name: 'عالم الحيوان', drawThumb: drawAnimalsThumb, enabled: true },
  { id: 'languages', name: 'اللغات والأمثال الشعبية', drawThumb: drawLanguagesThumb, enabled: true },
  { id: 'puzzles', name: 'ألغاز وذكاء', drawThumb: drawPuzzlesThumb, enabled: true }
];

const TRIVIA_QUESTIONS = [
  { categoryId: 'historyGeo', question: 'ما عاصمة المملكة العربية السعودية؟', options: ['جدة', 'الرياض', 'مكة', 'الدمام'], correctIndex: 1 },
  { categoryId: 'puzzles', question: 'كم عدد أيام السنة الكبيسة؟', options: ['364', '365', '366', '367'], correctIndex: 2 },
  { categoryId: 'space', question: 'ما أكبر كوكب في المجموعة الشمسية؟', options: ['زحل', 'المشتري', 'نبتون', 'أورانوس'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'في أي قارة تقع مصر؟', options: ['آسيا', 'أفريقيا', 'أوروبا', 'أمريكا'], correctIndex: 1 },
  { categoryId: 'science', question: 'ما لون دم الإنسان؟', options: ['أزرق', 'أحمر', 'أخضر', 'أصفر'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما أطول نهر في العالم؟', options: ['النيل', 'الأمازون', 'الفرات', 'الدانوب'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما عاصمة فرنسا؟', options: ['باريس', 'ليون', 'مرسيليا', 'نيس'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { categoryId: 'animals', question: 'ما الحيوان الذي يلقب بملك الغابة؟', options: ['النمر', 'الأسد', 'الفيل', 'الدب'], correctIndex: 1 },
  { categoryId: 'science', question: 'ما الغاز الذي تخرجه النباتات ليلاً؟', options: ['الأكسجين', 'ثاني أكسيد الكربون', 'غاز الأرجون', 'الهيليوم'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'في أي شهر يُحتفل برأس السنة الميلادية؟', options: ['ديسمبر', 'يناير', 'مارس', 'يونيو'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما عاصمة اليابان؟', options: ['أوساكا', 'طوكيو', 'كيوتو', 'هيروشيما'], correctIndex: 1 },
  { categoryId: 'puzzles', question: 'كم عدد أيام الأسبوع؟', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { categoryId: 'science', question: 'ما المادة التي يتكون منها الماس؟', options: ['الكربون', 'الحديد', 'الذهب', 'الفضة'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما أصغر دولة في العالم؟', options: ['موناكو', 'الفاتيكان', 'سان مارينو', 'لوكسمبورغ'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما عاصمة تركيا؟', options: ['إسطنبول', 'أنقرة', 'إزمير', 'بورصة'], correctIndex: 1 },
  { categoryId: 'space', question: 'كم عدد كواكب المجموعة الشمسية؟', options: ['7', '8', '9', '10'], correctIndex: 1 },
  { categoryId: 'languages', question: 'ما اللغة الرسمية في البرازيل؟', options: ['الإسبانية', 'البرتغالية', 'الإنجليزية', 'الفرنسية'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما عاصمة إيطاليا؟', options: ['ميلانو', 'روما', 'فنيقية', 'نابولي'], correctIndex: 1 },
  { categoryId: 'science', question: 'كم عدد أضلاع الإنسان؟', options: ['20', '22', '24', '26'], correctIndex: 2 },
  { categoryId: 'animals', question: 'ما أسرع حيوان بري؟', options: ['الأسد', 'الفهد', 'الحصان', 'الغزال'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'في أي محيط تقع جزر المالديف؟', options: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط الهادئ', 'المحيط المتجمد الشمالي'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما عاصمة أستراليا؟', options: ['سيدني', 'ملبورن', 'كانبيرا', 'بيرث'], correctIndex: 2 },
  { categoryId: 'puzzles', question: 'كم مجموع زوايا المثلث؟', options: ['90', '180', '270', '360'], correctIndex: 1 },
  { categoryId: 'science', question: 'ما المعدن السائل في درجة حرارة الغرفة؟', options: ['الزنك', 'الزئبق', 'الرصاص', 'القصدير'], correctIndex: 1 },
  { categoryId: 'historyGeo', question: 'ما عاصمة كندا؟', options: ['تورنتو', 'فانكوفر', 'أوتاوا', 'مونتريال'], correctIndex: 2 },
  { categoryId: 'science', question: 'كم عدد ألوان قوس قزح؟', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { categoryId: 'historyGeo', question: 'ما أكبر محيط في العالم؟', options: ['المحيط الأطلسي', 'المحيط الهندي', 'المحيط الهادئ', 'المحيط المتجمد الشمالي'], correctIndex: 2 },
  { categoryId: 'historyGeo', question: 'ما عاصمة المغرب؟', options: ['الدار البيضاء', 'الرباط', 'مراكش', 'فاس'], correctIndex: 1 },

  { categoryId: 'historyGeo', question: 'ما هو المضيق الذي يفصل بين قارتي آسيا وأمريكا الشمالية؟', options: ['مضيق بيرنغ', 'مضيق جبل طارق', 'مضيق هرمز', 'مضيق باب المندب'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'من هو أول إمبراطور للإمبراطورية الرومانية؟', options: ['أغسطس', 'يوليوس قيصر', 'نيرون', 'كاليغولا'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي أكبر دولة في العالم من حيث المساحة؟', options: ['روسيا', 'كندا', 'الصين', 'الولايات المتحدة'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'في أي بلد وقعت معركة عين جالوت التاريخية؟', options: ['فلسطين', 'مصر', 'سوريا', 'الأردن'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي الدولة التي تشترك في أطول حدود برية مع تشيلي؟', options: ['الأرجنتين', 'البرازيل', 'البيرو', 'بوليفيا'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'أي حضارة قديمة اشتهرت بالكتابة المسمارية؟', options: ['الحضارة السومرية', 'الحضارة الفرعونية', 'الحضارة الفينيقية', 'الحضارة الإغريقية'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي أصغر دولة مستقلة في العالم من حيث المساحة؟', options: ['الفاتيكان', 'موناكو', 'سان مارينو', 'مالطا'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'من هو الزعيم الذي قاد الهند نحو الاستقلال عبر المقاومة السلمية؟', options: ['المهاتما غاندي', 'جواهر لال نهرو', 'أنديرا غاندي', 'بوشان'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي عاصمة كندا؟', options: ['أوتاوا', 'تورونتو', 'مونتريال', 'فانكوفر'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'في أي قارة تقع جبال الألب الشهيرة؟', options: ['أوروبا', 'آسيا', 'أمريكا الشمالية', 'أفريقيا'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي أكبر دولة عربية من حيث المساحة؟', options: ['الجزائر', 'السودان', 'المملكة العربية السعودية', 'مصر'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هو المضيق الذي يربط بين البحر الأحمر وخليج عدن؟', options: ['باب المندب', 'هرمز', 'جبل طارق', 'البوسفور'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي الدولة التي توجد فيها مدينة دبي؟', options: ['الإمارات', 'عُمان', 'قطر', 'البحرين'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي عاصمة سلطنة عُمان؟', options: ['مسقط', 'صلالة', 'نزوى', 'صحار'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'في أي قارة تقع دولة أستراليا؟', options: ['أستراليا', 'آسيا', 'أوروبا', 'أفريقيا'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هو النهر الأطول في العالم؟', options: ['النيل', 'الأمازون', 'الميسيسيبي', 'الدانوب'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي عاصمة دولة قطر؟', options: ['الدوحة', 'الريان', 'الوكير', 'الخور'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي الدولة التي تشتهر بوجود "سور الصين العظيم"؟', options: ['الصين', 'اليابان', 'كوريا', 'الهند'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هي عاصمة البحرين؟', options: ['المنامة', 'المحرق', 'الرفاع', 'مدينة عيسى'], correctIndex: 0 },
  { categoryId: 'historyGeo', question: 'ما هو المحيط الذي يقع فيه مثلث برمودا الشهير؟', options: ['الأطلسي', 'الهادئ', 'الهندي', 'المتجمد الشمالي'], correctIndex: 0 },

  { categoryId: 'science', question: 'ما هو الغاز الذي يشكل النسبة الأكبر في الغلاف الجوي للأرض؟', options: ['النيتروجين', 'الأكسجين', 'الأرجون', 'ثاني أكسيد الكربون'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو الكوكب الأكثر سخونة في مجموعتنا الشمسية؟', options: ['الزهرة', 'عطارد', 'المريخ', 'المشتري'], correctIndex: 0 },
  { categoryId: 'science', question: 'كم عدد صمامات قلب الإنسان الطبيعي؟', options: ['4', '2', '3', '5'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو العنصر الكيميائي الذي يرمز له بالرمز (Au)؟', options: ['الذهب', 'الفضة', 'النحاس', 'الألومنيوم'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو الفيتامين الذي يصنعه الجسم عند التعرض لأشعة الشمس؟', options: ['فيتامين D', 'فيتامين C', 'فيتامين A', 'فيتامين B12'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو العلم الذي يهتم بدراسة الكائنات الحية؟', options: ['الأحياء', 'الجيولوجيا', 'الفيزياء', 'الفلك'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي أكبر غدة في جسم الإنسان؟', options: ['الكبد', 'البنكرياس', 'الغدة الدرقية', 'الغدة النخامية'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي المادة المسؤولة عن إعطاء النباتات لونها الأخضر؟', options: ['الكلوروفيل', 'الميلانين', 'الهيموغلوبين', 'الكاروتين'], correctIndex: 0 },
  { categoryId: 'science', question: 'أي من الكواكب التالية يعتبر كوكباً غازياً وليس صخرياً؟', options: ['زحل', 'المريخ', 'الأرض', 'عطارد'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو العظم الأطول والأقوى في جسم الإنسان؟', options: ['عظمة الفخذ', 'عظمة الساق', 'العمود الفقري', 'الترقوة'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي الوحدة المستخدمة لقياس شدة التيار الكهربائي؟', options: ['الأمبير', 'الفولت', 'الأوم', 'الوات'], correctIndex: 0 },
  { categoryId: 'science', question: 'كم يستغرق ضوء الشمس تقريباً للوصول إلى الأرض؟', options: ['8 دقائق', '8 ثوانٍ', 'ساعة واحدة', '24 ساعة'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي الطبقة الخارجية المقرمشة من الجلد؟', options: ['البشرة', 'الأدمة', 'النسيج تحت الجلدي', 'الخلايا الدهنية'], correctIndex: 0 },
  { categoryId: 'science', question: 'أي نوع من الصخور يتكون نتيجة ثوران البراكين وتجمد الحمم؟', options: ['الصخور النارية', 'الصخور الرسوبية', 'الصخور المتحولة', 'الصخور الرملية'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي فصيلة الدم التي تُعرف بـ "المستقبل العام" لأنها تستقبل من جميع الفصائل؟', options: ['+AB', '-O', '+O', '-AB'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو الغاز الأساسي المسبب لظاهرة الاحتباس الحراري؟', options: ['ثاني أكسيد الكربون', 'الأكسجين', 'الهيليوم', 'الهيدروجين'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو المكون الأساسي للؤلؤ الطبيعي؟', options: ['كربونات الكالسيوم', 'السيليكا', 'الكوارتز', 'الصوديوم'], correctIndex: 0 },
  { categoryId: 'science', question: 'كم عدد الأسنان اللبنية لدى الأطفال قبل أن تبدأ بالتبديل؟', options: ['20', '24', '16', '32'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هو الجهاز المستخدم لقياس الزلازل؟', options: ['السيزموجراف', 'البارومتر', 'التليسكوب', 'الترمومتر'], correctIndex: 0 },
  { categoryId: 'science', question: 'ما هي الحالة الفيزيائية الرابعة للمادة إلى جانب الصلبة والسائلة والغازية؟', options: ['البلازما', 'البلورية', 'الذرية', 'الضوئية'], correctIndex: 0 },

  { categoryId: 'technology', question: 'ما هي الكلمة التي ترمز إليها الحروف الأولى من شبكة (WWW) الشهيرة؟', options: ['World Wide Web', 'Web World Wide', 'Wide World Web', 'World Web Wide'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي لغة البرمجة الأساسية المستخدمة لتصميم الهيكل الظاهري لصفحات الإنترنت؟', options: ['HTML', 'Python', 'C++', 'Java'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي وحدة قياس سرعة المعالج (CPU) في الكمبيوترات الحديثة؟', options: ['الجيجاهرتز GHz', 'الجيجابايت GB', 'الميجابايت MB', 'الوات W'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي الشركة التقنية التي قامت بتطوير نظام التشغيل الشهير "أندرويد"؟', options: ['جوجل', 'أبل', 'مايكروسوفت', 'سامسونج'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو الاسم العلمي للذاكرة المؤقتة في الكمبيوتر والتي تفقد بياناتها عند انقطاع الكهرباء؟', options: ['RAM', 'ROM', 'SSD', 'CPU'], correctIndex: 0 },
  { categoryId: 'technology', question: 'أي من هذه الاختصارات يعبر عن شبكة الاتصال اللاسلكية المحلية؟', options: ['Wi-Fi', 'Bluetooth', 'GPS', '4G'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو نظام التشغيل الشهير الذي يرمز له بشعار "السمكة أو البطريق" وهو مفتوح المصدر؟', options: ['لينكس Linux', 'ويندوز Windows', 'ماك macOS', 'أندرويد Android'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي الشركة العالمية التي أطلقت هاتف "آيفون" لأول مرة عام 2007؟', options: ['أبل', 'سامسونج', 'نوكيا', 'سوني'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو المصطلح التقني الذي يُشير إلى "البرامج الخبيثة" التي تهدف لسرقة البيانات أو إتلافها؟', options: ['الملفات الضارة Malware', 'البرامج الحرة Freeware', 'التطبيقات المفتوحة Open-source', 'تحديثات النظام Updates'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي أعلى سعة تخزينية من بين الخيارات التالية؟', options: ['التيرابايت TB', 'الجيجابايت GB', 'الميجابايت MB', 'الكيلوبايت KB'], correctIndex: 0 },
  { categoryId: 'technology', question: 'في أي عام تم إطلاق منصة الفيديوهات الشهيرة "يوتيوب" رسمياً؟', options: ['2005', '2000', '2010', '1998'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو "البروتوكول" المسؤول عن تأمين وتشفير البيانات بين المتصفح والموقع (ويظهر في رابط الموقع)؟', options: ['HTTPS', 'FTP', 'IP', 'SMTP'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي التقنية التي تسمح للأجهزة الذكية بالاتصال وتبادل البيانات لمسافات قصيرة جداً بمجرد تلامسها (تُستخدم في الدفع الإلكتروني)؟', options: ['NFC', 'Bluetooth', 'Wi-Fi', 'GPS'], correctIndex: 0 },
  { categoryId: 'technology', question: 'أي شركة تقنية اشترت تطبيق "واتساب" الشهير في عام 2014؟', options: ['ميتا Meta', 'جوجل Google', 'مايكروسوفت Microsoft', 'أبل Apple'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي وظيفة وحدة معالجة الرسوميات (GPU) الأساسية في الأجهزة؟', options: ['معالجة الجرافيكس والألعاب', 'تخزين الملفات', 'توصيل الإنترنت', 'تبريد الجهاز'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو الاسم الشهير لشركة الذكاء الاصطناعي المطورة لروبوت المحادثة ChatGPT؟', options: ['OpenAI', 'Google DeepMind', 'Microsoft AI', 'Meta AI'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو الجزء المسؤول عن تزويد كافة قطع الكمبيوتر بالطاقة الكهربائية؟', options: ['مزود الطاقة Power Supply', 'اللوحة الأم Motherboard', 'المعالج CPU', 'الهارد ديسك Hard Disk'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي التقنية التي تُستخدم لتخزين البيانات عبر شبكة من الأجهزة دون وجود خادم مركزي (أساس العملات الرقمية)؟', options: ['البلوكشين Blockchain', 'الحوسبة السحابية Cloud', 'الذكاء الاصطناعي AI', 'الواقع الافتراضي VR'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هو الرمز (الأيقونة) الشهير المستوحى من اسم ملك دنماركي قديم لربط الأجهزة لاسلكياً؟', options: ['البلوتوث Bluetooth', 'الواي فاي Wi-Fi', 'GPS', 'الإنترنت'], correctIndex: 0 },
  { categoryId: 'technology', question: 'ما هي التقنية التي تدمج العناصر الرقمية والمعلومات مع البيئة الحقيقية للمستخدم (مثل لعبة بوكيمون غو)؟', options: ['الواقع المعزز AR', 'الواقع الافتراضي VR', 'الذكاء الاصطناعي AI', 'الميتافيرس Metaverse'], correctIndex: 0 },

  { categoryId: 'sports', question: 'ما هو النادي السعودي الذي يُلقب بـ "الزعيم"؟', options: ['الهلال', 'النصر', 'الاتحاد', 'الأهلي'], correctIndex: 0 },
  { categoryId: 'sports', question: 'كم عدد اللاعبين في فريق كرة القدم الواحد داخل الملعب أثناء المباراة؟', options: ['11 لاعب', '10 لاعبين', '12 لاعب', '9 لاعبين'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي السعودي الذي يُلقب بـ "العالمي"؟', options: ['النصر', 'الهلال', 'الشباب', 'الاتحاد'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي الغربي الشهير الذي يُلقب بـ "العميد" ويعتبر من أقدم أندية المملكة؟', options: ['الاتحاد', 'الأهلي', 'الوحدة', 'الاتفاق'], correctIndex: 0 },
  { categoryId: 'sports', question: 'كم مدة الشوط الواحد في مباراة كرة القدم الرسمية بدون الوقت بدل الضائع؟', options: ['45 دقيقة', '30 دقيقة', '60 دقيقة', '40 دقيقة'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي السعودي الذي يُلقب بـ "الراقي" أو "قلعة الكؤوس"؟', options: ['الأهلي', 'الشباب', 'القادسية', 'التعاون'], correctIndex: 0 },
  { categoryId: 'sports', question: 'من هو الهداف التاريخي لمنتخبنا السعودي الأول لكرة القدم؟', options: ['ماجد عبد الله', 'سامي الجابر', 'ياسر القحطاني', 'سعيد العويران'], correctIndex: 0 },
  { categoryId: 'sports', question: 'في أي مدينة سعودية يقع ملعب "الملك عبد الله الدولي" الشهير بـ (الجوهرة المشعة)؟', options: ['جدة', 'الرياض', 'الدمام', 'مكة المكرمة'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي العاصمي الشهير الذي يُلقب بـ "الليث"؟', options: ['الشباب', 'النصر', 'الهلال', 'الرياض'], correctIndex: 0 },
  { categoryId: 'sports', question: 'كم عدد التغييرات الأساسية المسموح بها لكل فريق في مباراة كرة القدم الرسمية (بدون الأشواط الإضافية)؟', options: ['5 تغييرات', '3 تغييرات', '4 تغييرات', '6 تغييرات'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو اللون الأساسي لطقم نادي الاتحاد السعودي؟', options: ['الأصفر والأسود', 'الأخضر والأبيض', 'الأزرق والأبيض', 'الأحمر والأسود'], correctIndex: 0 },
  { categoryId: 'sports', question: 'في أي مدينة سعودية يقع ملعب "الملك فهد الدولي" الشهير بـ (الدرة)؟', options: ['الرياض', 'جدة', 'الدمام', 'الطائف'], correctIndex: 0 },
  { categoryId: 'sports', question: 'كم عدد بطاقات الجزاء الملوّنة التي يحملها حكم مباراة كرة القدم؟', options: ['بطاقتان', 'بطاقة واحدة', 'ثلاث بطاقات', 'أربع بطاقات'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو لقب المنتخب السعودي الأول لكرة القدم؟', options: ['الأخضر', 'النسور', 'الفراعنة', 'النشامى'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي السعودي من مدينة الدمام الذي يُلقب بـ "فارس الدهناء"؟', options: ['الاتفاق', 'القادسية', 'الخليج', 'النهضة'], correctIndex: 0 },
  { categoryId: 'sports', question: 'أي من الأندية التالية يعتبر من أندية منطقة القصيم ويلعب في دوري المحترفين؟', options: ['التعاون', 'الفتح', 'الفيحاء', 'ضمك'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هو النادي السعودي الذي يرتدي الطقم الأزرق والأبيض كاملاً؟', options: ['الهلال', 'النصر', 'الشباب', 'الأهلي'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هي اللعبة الرياضية المختلفة التي يلعب فيها الفريق بـ 6 لاعبين فقط داخل الملعب؟', options: ['كرة الطائرة', 'كرة السلة', 'كرة اليد', 'كرة القدم'], correctIndex: 0 },
  { categoryId: 'sports', question: 'من هو اللاعب السعودي الشهير الذي سجل هدفاً تاريخياً في مرمى بلجيكا بكأس العالم 1994؟', options: ['سعيد العويران', 'فهد الهريفي', 'يوسف الثنيان', 'نواف التمياط'], correctIndex: 0 },
  { categoryId: 'sports', question: 'ما هي الرياضة التراثية الشهيرة التي تُقام لها سباقات سنوية كبرى في ميدان الملك عبد العزيز بالجنادرية؟', options: ['سباق الهجن', 'سباق الخيل', 'الصيد بالصقور', 'الرماية'], correctIndex: 0 },

  { categoryId: 'space', question: 'ما هو الجرم السماوي الذي كان يُصنف ككوكب تاسع في المجموعة الشمسية ثم تم تصنيفه ككوكب قزم؟', options: ['بلوتو', 'نبتون', 'أورانوس', 'سيريس'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الاسم العلمي للمجرّة الحلزونية التي تنتمي إليها كرتنا الأرضية ومجموعتنا الشمسية؟', options: ['درب التبانة', 'أندروميدا', 'المجرة البيضاوية', 'سحابة ماجلان'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هي القوة الفيزيائية التي تحافظ على دوران الكواكب في مدارات ثابتة حول الشمس؟', options: ['الجاذبية', 'المغناطيسية', 'الكهربائية', 'الطرد المركزي'], correctIndex: 0 },
  { categoryId: 'space', question: 'أي من الكواكب التالية يستغرق وقتاً أطول لإتمام دورة واحدة كاملة حول الشمس؟', options: ['نبتون', 'الأرض', 'المريخ', 'المشتري'], correctIndex: 0 },
  { categoryId: 'space', question: 'كم عدد الأقمار الطبيعية التي تدور حول كوكب الأرض؟', options: ['قمر واحد', 'قمران', 'ثلاثة أقمار', 'لا يوجد'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الثقب الأسود في الفضاء؟', options: ['منطقة ذات جاذبية هائلة لا يمكن حتى للضوء الهروب منها', 'كوكب ميت', 'نجم منطفئ', 'ممر سري بين المجرات'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الاسم الذي يُطلق على تجمع هائل من النجوم والغازات والغبار الكوني المترابط بالجاذبية؟', options: ['المجرة', 'السديم', 'المذنب', 'الكويكب'], correctIndex: 0 },
  { categoryId: 'space', question: 'من هو العالم الفلكي الشهير الذي أثبت عبر التليسكوب أن الأرض تدور حول الشمس وليس العكس؟', options: ['غاليليو غاليلي', 'إسحاق نيوتن', 'ألبيرت أينشتاين', 'ستيفن هوكينغ'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هي الظاهرة التي تحدث عندما يقع القمر تماماً بين الشمس والأرض فيحجب ضوءها؟', options: ['كسوف الشمس', 'خسوف القمر', 'الشفق القطبي', 'الاعتدال الخريفي'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو المكون الأساسي الذي تتكون منه النجوم بشكل رئيسي (مثل الشمس)؟', options: ['غاز الهيدروجين والهيليوم', 'الصخور والمعادن', 'الماء والجليد', 'الأكسجين والنيتروجين'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الاسم الذي يُطلق على الصخور الفضائية التي تخترق الغلاف الجوي للأرض وتحترق قبل وصولها للسطح؟', options: ['الشهب', 'المذنبات', 'الكواكب القزمة', 'السدم'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هي الوحدة الفلكية المستخدمة لقياس المسافات الشاسعة جداً بين النجوم والمجرات؟', options: ['السنة الضوئية', 'الكيلومتر', 'الميل الفلكي', 'السرعة الصوتية'], correctIndex: 0 },
  { categoryId: 'space', question: 'كم يبلغ عدد كواكب المجموعة الشمسية المعتمدة حالياً بعد استبعاد بلوتو؟', options: ['8 كواكب', '9 كواكب', '7 كواكب', '10 كواكب'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الكوكب الذي يدور حول نفسه بسرعة كبيرة لدرجة أن يومه هو الأقصر بين الكواكب (نحو 10 ساعات فقط)؟', options: ['المشتري', 'زحل', 'عطارد', 'الزهرة'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هي وكالة الفضاء العالمية الشهيرة التابعة للولايات المتحدة الأمريكية؟', options: ['ناسا NASA', 'إيسا ESA', 'روسكوزموس', 'روكيت لاب'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الاسم الذي يُطلق على ذيل الغبار والجليد المتوهج الذي يظهر خلف بعض الأجرام عند اقترابها من الشمس؟', options: ['المذنب', 'الكويكب', 'النجم النيوتروني', 'الشهاب'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الكوكب الذي يمتلك غلافاً جوياً سميكاً وحامضياً يجعله يعكس ضوء الشمس بشدة ويسطع كألمع جرم في السماء بعد القمر؟', options: ['الزهرة', 'المريخ', 'عطارد', 'أورانوس'], correctIndex: 0 },
  { categoryId: 'space', question: 'في أي عام هبط الإنسان لأول مرة على سطح القمر من خلال رحلة أبولو 11؟', options: ['1969', '1955', '1975', '1980'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هي الظاهرة البصرية الساحرة التي تظهر في سماء المناطق القطبية نتيجة تفاعل الرياح الشمسية مع الغلاف الجوي؟', options: ['الشفق القطبي', 'السراب', 'قوس قزح الفضائي', 'أمطار الشهب'], correctIndex: 0 },
  { categoryId: 'space', question: 'ما هو الاسم الذي يُطلق على الانفجار العظيم والمفاجئ الذي يحدث للنجم في نهاية عمره؟', options: ['السوبرنوفا المستعر الأعظم', 'الاندماج النووي', 'الولادة النجمية', 'الثقب الأبيض'], correctIndex: 0 },

  { categoryId: 'animals', question: 'ما هو الطائر الوحيد الذي يمتلك القدرة على الطيران للخلف؟', options: ['الطنان', 'الهدهد', 'الصقر', 'الببغاء'], correctIndex: 0 },
  { categoryId: 'animals', question: 'أي من الحيوانات التالية يعتبر من الثدييات التي تلد وترضع صغارها بالرغم من أنه يعيش في الماء؟', options: ['الدلفين', 'القرش', 'الأخطبوط', 'قنديل البحر'], correctIndex: 0 },
  { categoryId: 'animals', question: 'كم عدد قلوب حيوان الأخطبوط؟', options: ['3 قلوب', 'قلب واحد', 'قلبان', '4 قلوب'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الذي يُلقب بـ "سفينة الصحراء" لقدرته العالية على تحمل العطش؟', options: ['الجمل', 'الحصان', 'الحمار الوحشي', 'الغزال'], correctIndex: 0 },
  { categoryId: 'animals', question: 'أي من هذه الطيور يعتبر طائراً ولكنه لا يملك القدرة على الطيران؟', options: ['النعامة', 'النسر', 'الغراب', 'الحمامة'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان البري الذي يمتلك أطول رقبة في العالم؟', options: ['الزرافة', 'الفيل', 'الخرتيت', 'المها'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الاسم الذي يُطلق على صغير الأسد؟', options: ['شبل', 'جرو', 'مهر', 'دغفل'], correctIndex: 0 },
  { categoryId: 'animals', question: 'كم عدد أرجل العنكبوت في الطبيعة؟', options: ['8 أرجل', '6 أرجل', '10 أرجل', '12 رجلاً'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الذي يمتلك أثقل وزن لسان في العالم، لدرجة أنه قد يزن وزن فيل كامل؟', options: ['الحوت الأزرق', 'الفيل الإفريقي', 'قرش الحوت', 'فرس النهر'], correctIndex: 0 },
  { categoryId: 'animals', question: 'أي من الحواس التالية يمتلكها الثعبان بشكل قوي جداً ويعتمد عليها باستخدام لسانه؟', options: ['الشم', 'السمع', 'البصر', 'التذوق'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الوحيد الذي ينام وعيناه مفتوحتان لأنه لا يملك جفوناً؟', options: ['السمك', 'القط البري', 'الأرنب', 'الخفاش'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الاسم الذي يُطلق على صغير الفرس (الحصان)؟', options: ['مهر', 'فصيل', 'حمل', 'قسورة'], correctIndex: 0 },
  { categoryId: 'animals', question: 'أي من الحيوانات التالية يعتبر من ذوات الدم البارد (تتغير حرارة جسمه حسب البيئة)؟', options: ['التماسيح', 'الدببة', 'الذئاب', 'الغزلان'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الطائر الذي يضع أكبر بيضة في العالم من حيث الحجم والوزن؟', options: ['النعامة', 'البجعة', 'النسر', 'البومة'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الذي يشتهر بوجود كيس (جراب) على بطنه يحمل فيه صغاره؟', options: ['الكنغر', 'الكوالا', 'السنجاب', 'القنفذ'], correctIndex: 0 },
  { categoryId: 'animals', question: 'كم عدد أصابع أقدام النعامة في كل قدم؟', options: ['إصبعان', 'ثلاثة أصابع', 'أربعة أصابع', 'خمسة أصابع'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الثديي الوحيد الذي يمتلك القدرة على الطيران الفعلي كالطيور؟', options: ['الخفاش', 'السنجاب الطائر', 'البومة', 'الخلد'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الاسم الذي يُطلق على صوت الأسد؟', options: ['زئير', 'صهيل', 'مواء', 'نباح'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هو الحيوان الذي يمتلك أقوى ذاكرة لدرجة أنه لا ينسى الأماكن ولا الأشخاص لسنوات طويلة؟', options: ['الفيل', 'الكلب', 'القط', 'الحمار'], correctIndex: 0 },
  { categoryId: 'animals', question: 'ما هي المادة الأساسية التي تتكون منها قرون وحيد القرن (الخرتيت) وكذلك أظافر الإنسان؟', options: ['الكيراتين', 'العاج', 'الكالسيوم', 'الغضاريف'], correctIndex: 0 },

  { categoryId: 'languages', question: 'ما هو المعنى الفصيح لكلمة "الغسق"؟', options: ['أول ظلمة الليل', 'وقت الظهيرة', 'شروق الشمس', 'نور الفجر'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشعبي الشهير: "ربّ رمية من غير..."؟', options: ['رامٍ', 'قناص', 'سهم', 'هدف'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما هي اللغة التي تُعرف بـ "لغة الضاد"؟', options: ['اللغة العربية', 'اللغة الفارسية', 'اللغة الأردية', 'اللغة التركية'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل العربي القديم: "على أهلها جنت..."؟', options: ['براقش', 'سعاد', 'هند', 'ليلى'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما معنى كلمة "البيداء" في اللغة العربية؟', options: ['الصحراء', 'الغابة', 'البحر', 'الجبل'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشعبي: "من حفر حفرة لأخيه..."؟', options: ['وقع فيها', 'نجا منها', 'دفنه فيها', 'ابتعد عنها'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما هو الاسم الذي يُطلق على الشاعر الذي عاصر الجاهلية والإسلام؟', options: ['مخضرم', 'جاهلي', 'محدث', 'أموي'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشهير: "إذا غاب القط العب يا..."؟', options: ['فار', 'كلب', 'أرنب', 'طير'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما معنى كلمة "الحسام" في لغة العرب؟', options: ['السيف القاطع', 'الدرع القوي', 'السهم السريع', 'الرمح الطويل'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشعبي: "لولا اختلاف الأذواق لـ..."؟', options: ['بارت السلع', 'فسدت الأطعمة', 'ضاعت الأموال', 'فرح الجميع'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما هي اللغة الرسمية والأساسية التي تتحدث بها دولة البرازيل؟', options: ['البرتغالية', 'الإسبانية', 'الإنجليزية', 'الفرنسية'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل العربي: "إن غداً لناظره..."؟', options: ['قريب', 'بعيد', 'جميل', 'عجيب'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ماذا تعني كلمة "الورى" في قصائد الشعر واللغة؟', options: ['الخلق أو الناس', 'الذهب', 'المرض', 'الليل'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشهير: "عصفور في اليد خير من عشرة على..."؟', options: ['الشجرة', 'الأرض', 'السطح', 'الجدار'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما هي اللغة التي اشتقت منها معظم اللغات الأوروبية الحديثة (مثل الإيطالية والفرنسية)؟', options: ['اللاتينية', 'اليونانية', 'الهيروغليفية', 'السنسكريتية'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشعبي: "الكتاب يبان من..."؟', options: ['عنوانه', 'صفحته الأولى', 'خاتمته', 'سعره'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما معنى كلمة "الوجيز" في المعاجم العربية؟', options: ['المختصر المفيد', 'الشيء الثمين', 'الوقت الضيق', 'الرجل القوي'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل: "لا تؤجل عمل اليوم إلى..."؟', options: ['الغد', 'الأسبوع القادم', 'المساء', 'وقت لاحق'], correctIndex: 0 },
  { categoryId: 'languages', question: 'ما هو اللقب الذي يُطلق على المعجم أو قاموس اللغة قديماً؟', options: ['القاموس المحيط', 'كتاب النحو', 'ديوان العرب', 'أصل الكلمات'], correctIndex: 0 },
  { categoryId: 'languages', question: 'أكمل المثل الشعبي: "رضا الناس غاية لا..."؟', options: ['تدرك', 'تطلب', 'تضيع', 'تباع'], correctIndex: 0 },

  { categoryId: 'puzzles', question: 'أنا شيء أملك قلباً ينبض بالحياة، ولكني أموت فوراً إذا توقفت عن الحركة، فمن أنا؟', options: ['الساعة', 'الدراجة', 'السيارة', 'القطار'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يملك أرجلاً كثيرة ولكنه لا يستطيع المشي خطوة واحدة، ويتحرك فقط إذا حُمِل؟', options: ['الكرسي', 'المركب', 'الجدول', 'المشط'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'إذا صببت الماء فوقي لا أبتل، وإذا وضعتني في النار لا أحترق، وإذا تركتني في الظلام اختفيت، فمن أنا؟', options: ['الظل', 'السراب', 'الهواء', 'الزجاج'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'أنا ابن الماء، ولكني إذا تُركت داخل الماء لفترة طويلة أموت وأختفي، فمن أنا؟', options: ['الثلج', 'الملح', 'السكر', 'السمك'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي ترميه كلما احتجت إليه، وتقتلعه وتخبئه إذا لم تعد بحاجة له؟', options: ['مرساة السفينة', 'شبكة الصيد', 'مفتاح البيت', 'البذور'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'شيء يركض خلفك في النهار طوال الوقت، وله نفس حجمك وشكلك تماماً، لكن وزنه يساوي صفراً، فما هو؟', options: ['خيالك', 'انعكاسك', 'حذاؤك', 'ثوبك'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يحيط بالمدن والقرى والمنازل، ويسافر لآلاف الكيلومترات دون أن يتحرك سنتمتراً واحداً؟', options: ['الطريق', 'الجدار', 'الهواء', 'السياج'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'أتحرك دائماً وأسير للأمام بسرعة، ولكني لا أملك أرجلاً، ولا أستطيع العودة للوراء ولو لثانية واحدة، فمن أنا؟', options: ['الوقت', 'الماء', 'القطار', 'العمر'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'سلسلة أعداد تبدأ بـ: 2، 4، 8، 16... فما هو العدد الذي يجب أن يتبعها في هذا النمط؟', options: ['32', '20', '24', '64'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'خمسة أشقاء نصيب كل واحد منهم الضعف مما قبله، فإذا كان نصيب الأصغر 3 ريالات، فكم نصيب الأخ الأكبر (الخامس)؟', options: ['48 ريال', '24 ريال', '15 ريال', '30 ريال'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يملك قفلاً بلا مفتاح، ويفتح لك الأبواب إلى بلاد وأزمنة لم ترها قط؟', options: ['الكتاب', 'العقل', 'السفر', 'التلفاز'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يخترق الزجاج السميك والنوافذ المغلقة بسهولة تامة، دون أن يكسرها أو يترك أي أثر عليها؟', options: ['الضوء', 'الصوت', 'الهواء', 'الرصاص'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'عددان إذا ضربتهما معاً كان الناتج 16، وإذا طرحت الأصغر من الأكبر كان الناتج 6، فما هما؟', options: ['8 و 2', '4 و 4', '16 و 1', '10 و 4'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'رقم إذا ضربته في الرقم الذي يليه مباشرة، كان حاصل الضرب مساوياً لحاصل جمعهما مضافاً إليه 11، فما هو الرقم؟', options: ['4', '5', '6', '3'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'أنا صندوق بلا قفل ولا مفتاح ولا أبواب، وبالرغم من ذلك أُخفي بداخلي كنزاً ذهبياً ثميناً، فمن أنا؟', options: ['البيضة', 'الكتاب', 'العقل', 'المحارة'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ساعة حائط تدق مرة واحدة عند الساعة الواحدة، ومرتين عند الثانية، وهكذا... كم عدد الدقات الكلي التي تدقها في 6 ساعات فقط؟', options: ['21 دقة', '6 دقات', '12 دقة', '18 دقة'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يملك رقبة طويلة وجسماً نحيفاً، ولكنه لا يملك رأساً ولا أطرافاً؟', options: ['الزجاجة', 'القميص', 'الزرافة', 'القلم'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'إذا حذفت الحرف الأول مني طرت في السماء، وإذا حذفت الحرف الأخير مني صرت شيئاً ثميناً يُباع ويُشترى، فمن أنا؟', options: ['قطار', 'مطار', 'جمال', 'خاتم'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'شيء يتكلم ويرد عليك بكل لغات الأرض التي تتحدث بها، ولكنه لا يملك عقلاً ولا لساناً ولا ينطق إلا بعدك، فما هو؟', options: ['الصدى', 'المذياع', 'الهاتف', 'الببغاء'], correctIndex: 0 },
  { categoryId: 'puzzles', question: 'ما هو الشيء الذي يولد كبيراً جداً وطويلاً، وكلما مرت عليه الأيام وعاش أكثر، قَصُر طوله وصغُر حجمه؟', options: ['الشمعة', 'الإنسان', 'الشجرة', 'القلم'], correctIndex: 0 }
];

function getTriviaCategoryById(categoryId) {
  return TRIVIA_CATEGORIES.find((cat) => cat.id === categoryId) || null;
}

function getTriviaQuestionsForCategory(categoryId) {
  return TRIVIA_QUESTIONS.filter((q) => q.categoryId === categoryId);
}

function isTriviaCategoryPlayable(categoryId) {
  return getTriviaQuestionsForCategory(categoryId).length > 0;
}
