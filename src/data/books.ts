import {AuthorProfile, Book, BookStatus} from '../types/book';

export const COVER_IMAGES = [
  'https://lh3.googleusercontent.com/aida/ALJJyrAnYQLwjmJc5Ti-eLxrRndI2iz-ajxL9t3Ruo6hXkldtrlKGt5q6kuMuQB5aCmJ9vwYCXrSwMeeOpw2ur-iz94BM9Nw0V5xxmwHLQuExtqGyMVeHQdhoeBtZAB9K3IEC3i7jgxcWRC5NJdAD86gN9u-UA2wIAcQ85ozMoSVQlfgCDwOxTJuxkfR4fDUqIzDH2pF3qjimeGc9frm2kFU-sy4qu7ssAuGQ9YO6wNRVrVujt72ohXfyQ',
  'https://lh3.googleusercontent.com/aida/ALJJyrClEBvf8EBZvFEGbc-9u_ASvT661X82uxTbkX8Wi2kne9FPmWtrrVuYyB7P1S-irbzuNdUkBkj4o9rPdIdmObX4YhNY4G3mjHZsWfKyvejKQGrrkS4De3bsPe20wYFUaRI83c8mNe_lo0gh0d2ZaDrM2NDY2AvK-RAuwp1BopyH5ctTS3MCEAwHsUc7oADewJFqMlQPnQ6oW0dCZRHEc05Abp0BvOTlvBQ9IQtAo_w2mM0MvL_BNw',
  'https://lh3.googleusercontent.com/aida/ALJJyrBKMMiyT5m6CR_PF5SbFyZxlirT5c_WmssiCuMpCT39WiQlq2T2M1KEebxda7U3PWkC1mtyJWfgM7Sg-cnkiMKcYklrar2HAe6fWp5OVoTvam-dmXi4Aq9pRA1KI8lGzvPS266LHnIs0GYCZYiLtxzazG3ypL8zpjuZo2YoCZhkNt4kH15ggFStsf8_mz9d5SPg6d-9L5UkdxRc73_NQuyfZ5v3Cufai2lgIwFS6YG3ttA37dpjEA',
  'https://lh3.googleusercontent.com/aida/ALJJyrBNUT-36d7SHkw-dmPCpzb8eQPaRb8eebhwpV_xEcWBBtrgGkp_prS6gxcC_dKCKa93E4_kRPOmnTVm-lQYvgJGmnx8zA9yPOTN6LLNroygDnNh0Ts6IfLO_bWGTAAsH0kF7PHsC2oFnseeJGGp5q-iB7jgNWouhq0z8PzIKumgIZKEtnq4ri1P1cCsZW0641FkSfqFBzsg3H7-qmahbuSrYOTOsR9N2p7EkN1Gvr7r2PW7FQilrQ',
  'https://lh3.googleusercontent.com/aida/ALJJyrB6DEyanx9nasL29ZuSPO1sM8t01Jp9XVWiAIiKjR-Iy8AKLEr6NV7_ONwA4XYJCqmkFeLY0c9p6TIHCsWpn8ZcbvfZu9XM9YNj1ahUwxwHs35mccZ4S4MbC1IzfAvZKzXeve8IjFzQjSipBaCKp80Q2SlTQjUHMOgMolrezpcant1L0ChGZt5Cdz4LtJjv3qt2ZrhvQxSdM8jOzACzQu04SVwCTPyR6Nw3AC0DCERLhtu_27k0cg',
  'https://lh3.googleusercontent.com/aida/ALJJyrDFKsAh2VB-rTxccBMJ1sty4CJ5PXixGSX91KcLOHU53p5okUTAsMXGnXXIJVMQyOrr9ZNYcg_ngdBX7Zw1GoeFBxhsqabE7SmbjZZi1pTOmoRBw8GzC_WaT17pHKnD04oVkcXbNd3nrBRU1QIQHvcMoiIIiVBk6rZ8MgoKXPTbyGfELTYVRsGVWa2c1VY2ADctA9DLqn7FFdhz_TdUMk2yMYN0zDBu1rSUdRoUBEApCMLoBdaB',
];

export function getBookTags(book: Pick<Book, 'genre' | 'genres'>): string[] {
  if (Array.isArray(book.genres) && book.genres.length > 0) {
    const cleaned = Array.from(new Set(book.genres.map((g) => g.trim()).filter(Boolean)));
    if (cleaned.length > 0) return cleaned;
  }
  return book.genre ? [book.genre.trim()] : [];
}

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Rừng Na Uy',
    author: 'Haruki Murakami',
    genre: 'Tiểu thuyết',
    genres: ['Tiểu thuyết', 'Lãng mạn'],
    rating: 5,
    synopsis: 'Câu chuyện về tình yêu, sự mất mát và tuổi trẻ đầy chênh vênh của Watanabe Toru giữa Tokyo thập niên 60.',
    backContent: '“Cái chết không phải là đối nghịch của sự sống, mà là một phần tồn tại trong nó.”',
    notes: 'Đọc lại mỗi mùa thu.',
    image: COVER_IMAGES[0],
    status: 'reading',
  },
  {
    id: 'b2',
    title: 'Hoàng Tử Bé',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Triết lý',
    genres: ['Triết lý', 'Giả tưởng'],
    rating: 5,
    synopsis: 'Hành trình qua các tiểu hành tinh của cậu bé tóc vàng để nhận ra điều cốt lõi chỉ có thể nhìn bằng trái tim.',
    backContent: '“Người lớn chẳng bao giờ tự mình hiểu nổi điều gì, thật mệt cho trẻ con lúc nào cũng phải giải thích.”',
    notes: 'Cuốn sách gối đầu giường.',
    image: COVER_IMAGES[1],
    status: 'done',
  },
  {
    id: 'b3',
    title: 'Dế Mèn Phiêu Lưu Ký',
    author: 'Tô Hoài',
    genre: 'Văn học Việt',
    genres: ['Văn học Việt', 'Phiêu lưu'],
    rating: 4,
    synopsis: 'Chuyến phiêu lưu qua thế giới côn trùng đầy màu sắc, từ kiêu ngạo đến trưởng thành và nghĩa tình.',
    backContent: 'Ghi chép hành trình bốn bể: bãi cỏ ven sông, đầm lầy mùa mưa và tình bạn không quên.',
    notes: '',
    image: COVER_IMAGES[2],
    status: 'want',
  },
  {
    id: 'b4',
    title: 'Số Đỏ',
    author: 'Vũ Trọng Phụng',
    genre: 'Văn học Việt',
    genres: ['Văn học Việt', 'Tiểu thuyết'],
    rating: 5,
    synopsis: 'Bức tranh châm biếm sắc sảo xã hội thành thị qua bước đường thăng tiến kỳ lạ của Xuân Tóc Đỏ.',
    backContent: 'Ấn bản lưu trữ Hang Chuột Chũi · Trào phúng hiện đại Việt Nam 1936.',
    notes: '',
    image: COVER_IMAGES[3],
    status: 'want',
  },
  {
    id: 'b5',
    title: 'Chuyến Tàu Đêm',
    author: 'Miyazawa Kenji',
    genre: 'Giả tưởng',
    genres: ['Giả tưởng', 'Triết lý'],
    rating: 4,
    synopsis: 'Giovanni và Campanella cùng bước lên đoàn tàu băng qua Dải Ngân Hà lấp lánh ánh sao.',
    backContent: 'Vé tàu một chiều đi qua Ngân Hà · Đêm lễ hội Thiên Hà.',
    notes: 'Đang đọc chương 6.',
    image: COVER_IMAGES[4],
    status: 'reading',
  },
  {
    id: 'b6',
    title: 'Khu Vườn Ngôn Từ',
    author: 'Shinkai Makoto',
    genre: 'Lãng mạn',
    genres: ['Lãng mạn', 'Tiểu thuyết'],
    rating: 4,
    synopsis: 'Những buổi sáng mưa rơi trong công viên Shinjuku, nơi hai tâm hồn lạc lối tìm thấy sự đồng điệu.',
    backContent: '“Tiếng sấm rền khẽ vọng, mây kéo về rợp trời, liệu người có ở lại đây cùng ta?”',
    notes: '',
    image: COVER_IMAGES[5],
    status: 'done',
  },
  {
    id: 'b7',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    genre: 'Phiêu lưu',
    genres: ['Phiêu lưu', 'Triết lý'],
    rating: 5,
    synopsis: 'Chàng chăn cừu Santiago lên đường tìm kho báu ở Kim Tự Tháp và học cách lắng nghe ngôn ngữ vũ trụ.',
    backContent: 'Khi bạn khao khát một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được.',
    notes: 'Rất truyền cảm hứng.',
    image: COVER_IMAGES[0],
    status: 'done',
  },
  {
    id: 'b8',
    title: 'Mắt Biếc',
    author: 'Nguyễn Nhật Ánh',
    genre: 'Lãng mạn',
    genres: ['Lãng mạn', 'Văn học Việt'],
    rating: 4,
    synopsis: 'Mối tình đơn phương lặng lẽ của Ngạn dành cho đôi mắt biếc của Hà Lan từ làng Đo Đo.',
    backContent: 'Đồi sim tím chiều làng Đo Đo và tiếng đàn guitar giữ lại tuổi thơ.',
    notes: '',
    image: COVER_IMAGES[1],
    status: 'want',
  },
  {
    id: 'b9',
    title: 'Kẻ Tìm Đường',
    author: 'Phan Văn Trường',
    genre: 'Triết lý',
    genres: ['Triết lý'],
    rating: 4,
    synopsis: 'Những chiêm nghiệm thực tế về nghề nghiệp, văn hóa và hành trình giữ vững bản sắc cá nhân.',
    backContent: 'Sổ tay đọc chậm: Đi nhiều để biết cách quay về với chính mình.',
    notes: '',
    image: COVER_IMAGES[2],
    status: 'want',
  },
];

export const TAG_ITEMS = [
  'Tất cả',
  'Tiểu thuyết',
  'Văn học Việt',
  'Triết lý',
  'Giả tưởng',
  'Lãng mạn',
  'Phiêu lưu',
];

export const GENRE_OPTIONS = TAG_ITEMS.filter((tag) => tag !== 'Tất cả');

export const STATUS_META: Record<BookStatus, {label: string; badgeClass: string}> = {
  want: {
    label: 'Muốn đọc',
    badgeClass: 'bg-light-secondary-container text-light-on-secondary-container',
  },
  reading: {
    label: 'Đang đọc',
    badgeClass: 'bg-light-tertiary-container text-light-on-tertiary-container',
  },
  done: {
    label: 'Đã xong',
    badgeClass: 'bg-light-primary text-light-on-primary',
  },
};

export const STORAGE_KEY = 'hang_chuot_chui_books_v2';
export const THEME_STORAGE_KEY = 'hang_chuot_chui_theme_v1';
export const SPEED_STORAGE_KEY = 'hang_chuot_chui_speed_v1';
export const CURVED_LOOP_STORAGE_KEY = 'hang_chuot_chui_curved_loop_v1';
export const DRIFTWALL_COPY_STORAGE_KEY = 'hang_chuot_chui_driftwall_copy_v1';
export const TAG_SIDEBAR_STORAGE_KEY = 'hang_chuot_chui_tag_sidebar_v1';
export const AUTHOR_PROFILES_STORAGE_KEY = 'hang_chuot_chui_author_profiles_v1';
export const AUTHOR_SECTION_TITLE_STORAGE_KEY = 'hang_chuot_chui_author_section_title_v1';

export const DEFAULT_AUTHOR_PROFILES: AuthorProfile[] = [
  {id: 'a1', name: 'Haruki Murakami', avatar: COVER_IMAGES[0]},
  {id: 'a2', name: 'Antoine de Saint-Exupéry', avatar: COVER_IMAGES[1]},
  {id: 'a3', name: 'Tô Hoài', avatar: COVER_IMAGES[2]},
  {id: 'a4', name: 'Vũ Trọng Phụng', avatar: COVER_IMAGES[3]},
  {id: 'a5', name: 'Miyazawa Kenji', avatar: COVER_IMAGES[4]},
  {id: 'a6', name: 'Shinkai Makoto', avatar: COVER_IMAGES[5]},
  {id: 'a7', name: 'Paulo Coelho', avatar: COVER_IMAGES[0]},
  {id: 'a8', name: 'Nguyễn Nhật Ánh', avatar: COVER_IMAGES[1]},
  {id: 'a9', name: 'Phan Văn Trường', avatar: COVER_IMAGES[2]},
];

export const DEFAULT_CURVED_LOOP_CONFIG = {
  mode: 'authors' as const,
  customText: 'Đọc chậm lại giữa thế gian vội vã ✦ Mỗi cuốn sách là một căn hầm trú ẩn ✦ Hang Chuột Chũi',
  speed: 1.4,
  color: '#99b966',
};

export const DEFAULT_DRIFTWALL_COPY = {
  badgePrefix: 'Dòng sách đang chạy',
  headline: 'Bấm vào bất kỳ quyển sách nào đang trôi để lật thẻ FlipCard & xem chi tiết',
  subHeadline: 'Di chuột để nghiêng góc nhìn 3D hoặc chọn thể loại bên trái để lọc tủ sách.',
  showBadge: true,
  showSubHeadline: true,
  headlineSize: 'md' as const,
  headlineColor: '#FFFFFF',
};

export const DEFAULT_TAG_SIDEBAR_CONFIG = {
  kicker: 'Thể loại & Tag',
  title: 'Chọn tag truyện',
  tags: TAG_ITEMS,
};
