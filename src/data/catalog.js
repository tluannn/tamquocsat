'use strict';

// [tên, nước, máu, id kỹ năng, mô tả]
const G=[
['Tào Tháo','Ngụy',4,'gianhung','Gian Hùng: bị mất máu thì rút 1 lá'],
['Tư Mã Ý','Ngụy',3,'phankich','Phản Kích: bị mất máu thì lấy 1 bài ngẫu nhiên của kẻ gây sát thương'],
['Hạ Hầu Đôn','Ngụy',4,'cuongliet','Cương Liệt: bị mất máu thì kẻ gây sát thương bỏ 1 bài (hết bài thì mất 1 máu)'],
['Chân Cơ','Ngụy',3,'lacthan','Lạc Thần: đầu lượt nếu có từ 2 bài trở xuống thì rút thêm 1 lá'],
['Lưu Bị','Thục',4,'nhanduc','Nhân Đức: mỗi lượt tặng 1 bài cho người khác rồi rút 1 lá; dùng Đào cũng rút 1 lá'],
['Quan Vũ','Thục',4,'vothanh','Võ Thánh: Sát bị né thì rút 1 lá'],
['Trương Phi','Thục',4,'baohao','Bào Hao: ra Sát không giới hạn'],
['Gia Cát Lượng','Thục',3,'khongthanh','Không Thành: hết bài thì không bị Sát'],
['Triệu Vân','Thục',4,'longdam','Long Đảm: dùng Sát như Thiểm và ngược lại'],
['Hoàng Trung','Thục',4,'lietcung','Liệt Cung: Sát không thể né nếu mục tiêu có từ 2 bài trở xuống'],
['Chu Du','Ngô',3,'anhtu','Anh Tư: rút 3 lá thay vì 2 ở đầu lượt'],
['Tôn Quyền','Ngô',4,'chehanh','Chế Hành (nút, 1 lần/lượt): bỏ 1 bài, rút 2 lá'],
['Tiểu Kiều','Ngô',3,'thienhuong','Thiên Hương: bị mất máu thì bổ sung bài lên 3 lá'],
['Lữ Bố','Quần',4,'vovsong','Vô Song: Sát của bạn cần 2 Thiểm để né'],
['Điêu Thuyền','Quần',3,'benguyet','Bế Nguyệt: cuối lượt rút 1 lá'],
['Hoa Đà','Quần',3,'capcuu','Cấp Cứu: mỗi lượt bỏ 1 bài hồi 1 máu cho người bị thương; tự dùng Đào hồi 2 máu'],
['Quách Gia','Ngụy',3,'yiji','Di Kế: mất máu thì rút 2 lá'],
['Trương Liêu','Ngụy',4,'tuxi','Đột Tập: đầu lượt lấy 1 bài đối thủ, sau đó rút 1 lá'],
['Mã Siêu','Thục',4,'tieqi','Thiết Kỵ: có 35% cơ hội Sát không thể né'],
['Cam Ninh','Ngô',4,'qixi','Kỳ Tập: mỗi lượt bỏ 1 bài để phá 1 bài đối thủ; dùng Quá Hà rút thêm 1 lá'],
['Hoàng Cái','Ngô',4,'khonhuc','Khổ Nhục: mất 1 máu để rút 2 lá'],
['Lục Tốn','Ngô',3,'qianxun','Khiêm Tốn: miễn nhiễm Thuận Thủ'],
['Viên Thiệu','Quần',4,'luanshe','Loạn Kích: dùng Vạn Tiễn rút 1 lá'],
['Đổng Trác','Quần',5,'jiuchi','Tửu Trì: dùng Quyết Đấu rút 1 lá'],
['Mã Đằng','Quần',4,'xiongyi','Hùng Dị: đầu lượt ít bài thì rút thêm 1 lá']];
// Bốn bảng bổ sung: 24 thẻ/nước. Những ký hiệu viết tắt chưa được xác định
// giữ nguyên nhãn nguồn; Khổng Minh là một biến thể thẻ của Gia Cát Lượng.
const EXTRA_HEROES={
 'Quần':[
  ['Bàng Đức','xuyengiap'],['Điền Phong','tamtinh'],['Giả Hủ','baothu'],['Hà Thái Hậu','thietve',3],
  ['Khổng Dung','haucan',3],['Kỳ Lân','tienphong',4],['Lý Giác & Quách Tị','cuongcong'],['Nhan Lương & Văn Xú','lapcong'],
  ['Phan Phụng','cuongcong'],['Tả Từ','khoiphuc',3],['Thái Văn Cơ','cuuho',3],['TiDiHo (chưa rõ)','binhtinh'],
  ['Trâu Thị','doatbai',3],['Trương Giác','thuattoan',3],['Trương Nhiệm','xuyengiap'],['Trương Tú','cuongcong'],
  ['Viên Thuật','haucan'],['Vu Cát','khoiphuc',3]
 ],
 'Ngô':[
  ['Chu Thái','thietcot'],['Đại Kiều','baothu',3],['Đinh Phụng','cuongcong'],['Lăng Tháo','tienphong'],
  ['Lăng Thống','baothu'],['Lỗ Túc','haucan',3],['Lục Kháng','binhtinh'],['Lữ Mông','binhtinh'],
  ['Lã Phạm','doatbai',3],['Ngô Quốc Thái','cuuho',3],['Thái Sử Từ','cuongcong'],['Tôn Kiên','lapcong'],
  ['Tôn Sách','xuyengiap'],['Tôn Thượng Hương','tamtinh',3],['Trần Võ & Đổng Tập','thietcot'],
  ['Trương Chiêu & Trương Hoành','quansu',3],['Tưởng Khâm','doatbai'],['Từ Thịnh','thietve']
 ],
 'Ngụy':[
  ['Biện Phu Nhân','cuuho',3],['Đặng Ngải','doatbai'],['Điển Vi','cuongcong'],['Hạ Hầu Uyên','cuongcong'],
  ['Hứa Chử','xuyengiap'],['Lý Điển','lapcong'],['Nhạc Tiến','cuongcong'],['Tang Bá','baothu'],
  ['Tào Hồng','thietcot'],['Tào Nhân','thietcot'],['Tào Phi','baothu'],['TDMG (chưa rõ)','thuattoan'],
  ['Trương Cáp','tienphong'],['Tuân Du','quansu',3],['Tuân Úc','haucan',3],['Từ Hoảng','doatbai'],
  ['Tưởng Cán','doatbai',3],['Vu Cấm','thietve']
 ],
 'Thục':[
  ['Bàng Thống','quansu',3],['Cam Phu Nhân','cuuho',3],['Chúc Dung','cuongcong'],['Hoàng Nguyệt Anh','thuattoan',3],
  ['Khổng Minh','quansu',3],['Khương Duy','xuyengiap'],['Lưu Thiện','thietve',3],['Lý Phong','tienphong'],
  ['Mã Đại','lapcong'],['Mạnh Hoạch','thietcot'],['Mã Tắc','haucan',3],['My Phu Nhân','cuuho',3],
  ['Ngụy Diên','lapcong'],['Pháp Chính','baothu',3],['Sa Ma Kha','tienphong'],
  ['TUPY (chưa rõ)','quansu',3],['Vương Bình','thietcot']
 ]
};
// Đây là 15 mẫu kỹ năng CÓ HIỆU ỨNG TRONG ENGINE, phỏng theo lối chơi
// Quốc Chiến rút gọn; không nhận là nguyên văn kỹ năng lá bài chính hãng.
const EXTRA_SKILLS={
 quansu:['Quân Sư','lần đầu mỗi lượt dùng lá mưu kế, rút 1 lá','Bị động · dùng mưu kế'],
 tienphong:['Tiên Phong','tầm đánh Sát tăng 1','Bị động · tầm đánh'],
 thietve:['Thiết Vệ','có 35% xác suất tự né Sát','Bị động · khi bị Sát'],
 cuongcong:['Cường Công','có thể dùng 2 lá Sát trong một lượt','Bị động · số lần Sát'],
 haucan:['Hậu Cần','đầu lượt nếu số bài trên tay không vượt máu hiện tại thì rút thêm 1 lá','Bị động · đầu lượt'],
 thietcot:['Thiết Cốt','giảm 1 sát thương của đòn đầu tiên nhận giữa hai lượt của mình','Bị động · khi chịu sát thương'],
 lapcong:['Lập Công','lần đầu mỗi lượt gây sát thương bằng Sát thì rút 1 lá','Bị động · sau khi đánh trúng'],
 tamtinh:['Tâm Tĩnh','bị mất máu và còn sống thì rút 1 lá','Phản ứng · khi mất máu'],
 baothu:['Báo Thù','kẻ gây sát thương phải bỏ ngẫu nhiên 1 bài nếu có','Phản ứng · khi mất máu'],
 xuyengiap:['Xuyên Giáp','Sát có 30% xác suất xuyên giáp và không thể né','Bị động · khi ra Sát'],
 doatbai:['Đoạt Bài','lần đầu mỗi lượt dùng Thuận Thủ hoặc Quá Hà thành công thì rút 1 lá','Bị động · sau mưu kế'],
 cuuho:['Cứu Hộ','tự dùng Đào hồi 2 máu thay vì 1','Bị động · hồi phục'],
 binhtinh:['Bình Tĩnh','giữ thêm tối đa 1 lá trên tay vào cuối lượt','Bị động · giới hạn bài'],
 khoiphuc:['Khôi Phục','đầu lượt nếu còn tối đa 2 máu thì hồi 1 máu','Bị động · đầu lượt'],
 thuattoan:['Thuật Toán','lần đầu mỗi lượt dùng Vô Trung Sinh Hữu thì rút thêm 1 lá','Bị động · dùng Vô Trung']
};
for(const [faction,rows] of Object.entries(EXTRA_HEROES))for(const [name,id,hp=4] of rows){
 if(G.some(x=>x[0]===name))throw Error('Trùng tên tướng: '+name);
 const [title,effect]=EXTRA_SKILLS[id];G.push([name,faction,hp,id,title+' (mô phỏng): '+effect]);
}
const C={
 sat:['Sát','⚔','Đánh một mục tiêu trong tầm, cần Thiểm để né'],thieu:['Thiểm','🛡','Né Sát hoặc Vạn Tiễn'],dao:['Đào','🍑','Hồi 1 máu hoặc cứu người sắp chết'],
 duel:['Quyết đấu','🤺','Hai bên thay nhau dùng Sát'],arrow:['Vạn tiễn','🏹','Mỗi người khác cần Thiểm'],nam:['Nam man','🐘','Mỗi người khác cần Sát'],steal:['Thuận thủ','🖐','Lấy một lá bài từ mục tiêu cách 1'],dis:['Quá hà','💥','Bỏ một lá bài của mục tiêu'],draw:['Vô trung','💡','Rút 2 lá'],wuxie:['Vô hiệu hóa','☯','Hủy một hiệu ứng mưu kế, có thể bị phản vô hiệu'],
 crossbow:['Liên Nỏ','⚙','Vũ khí tầm 1, dùng Sát không giới hạn'],spear:['Thanh Long Đao','🗡','Vũ khí tầm 2'],halberd:['Phương Thiên Kích','🔱','Vũ khí tầm 3'],
 bagua:['Bát Quái Trận','☯','Giáp: 45% tự né một lượt Sát'],shield:['Nhân Vương Thuẫn','🛡','Giáp: 35% chặn toàn bộ Sát'],horseplus:['Ngựa +1','🐎','Đối phương xa bạn thêm 1'],horseminus:['Ngựa −1','🐴','Bạn gần đối phương hơn 1']};
const TG=['sat','duel','steal','dis'],TRICK=['duel','arrow','nam','steal','dis','draw'];
const EQUIP={crossbow:{slot:'weapon',range:1},spear:{slot:'weapon',range:2},halberd:{slot:'weapon',range:3},bagua:{slot:'armor'},shield:{slot:'armor'},horseplus:{slot:'plus'},horseminus:{slot:'minus'}};