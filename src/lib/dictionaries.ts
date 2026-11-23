 
 
 
 
 
export const dictionaries = {
  uz: {
    nav: {
      projects: 'Loyihalar',
      about: 'Biz haqimizda',
      apartments: 'Xonadonlar',
      news: 'Yangiliklar',
      contact: 'Aloqa',
      order_call: 'Qönğiroq buyurtma qiliş'
    },
    hero: {
      details: 'Batafsil köriş',
      price_from: 'dan boşlab'
    },
    projects: {
      status: {
        ongoing: 'Jarayonda',
        completed: 'Topşirilgan',
        soon: 'Tez kunda',
        soldOut: 'Sotib tugatilgan',
        fewDaysLeft: 'Sanoqli kunlar qoldi',
        daysLeft: 'kun qoldi'
      },
      available: 'Böş xonadonlar',
      total: 'Jami xonadonlar',
      more: 'Köproq'
    },
    apartments: {
      filter: {
        rooms: 'Xonalar soni',
        floor: 'Qavat',
        area: 'Maydon',
        price: 'Narx'
      },
      status: {
        available: 'Bo\'sh',
        sold: 'Band',
        booked: 'Bronlangan'
      },
      book: 'Bron qiliş'
    },
    booking: {
      title: 'Xonadonni bron qiliş',
      form: {
        name: 'Ism',
        phone: 'Telefon raqami',
        payment: 'Tölov turi',
        note: 'Izoh',
        submit: 'Bron qiliş'
      },
      success: 'Menejer 30 daqiqa içida siz bilan boğlanadi'
    }
  },
  ru: {
    nav: {
      projects: 'Проекты',
      about: 'О нас',
      apartments: 'Квартиры',
      news: 'Новости',
      contact: 'Контакты',
      order_call: 'Заказать звонок'
    },
    hero: {
      details: 'Подробнее',
      price_from: 'от'
    },
    projects: {
      status: {
        ongoing: 'В процессе',
        completed: 'Сдано',
        soon: 'Скоро',
        soldOut: 'Все продано',
        fewDaysLeft: 'Осталось считанные дни',
        daysLeft: 'дней осталось'
      },
      available: 'Свободных квартир',
      total: 'Всего квартир',
      more: 'Больше'
    },
    apartments: {
      filter: {
        rooms: 'Кол-во комнат',
        floor: 'Этаж',
        area: 'Площадь',
        price: 'Цена'
      },
      status: {
        available: 'Свободно',
        sold: 'Продано',
        booked: 'Забронировано'
      },
      book: 'Забронировать'
    },
    booking: {
      title: 'Бронирование квартиры',
      form: {
        name: 'Имя',
        phone: 'Номер телефона',
        payment: 'Тип оплаты',
        note: 'Комментарий',
        submit: 'Забронировать'
      },
      success: 'Менеджер свяжется с вами в течение 30 минут'
    }
  },
  en: {
    nav: {
      projects: 'Projects',
      about: 'About Us',
      apartments: 'Apartments',
      news: 'News',
      contact: 'Contact',
      order_call: 'Order Call'
    },
    hero: {
      details: 'View Details',
      price_from: 'from'
    },
    projects: {
      status: {
        ongoing: 'Ongoing',
        completed: 'Completed',
        soon: 'Coming Soon',
        soldOut: 'Sold Out',
        fewDaysLeft: 'Few days left',
        daysLeft: 'days left'
      },
      available: 'Available Apartments',
      total: 'Total Apartments',
      more: 'More'
    },
    apartments: {
      filter: {
        rooms: 'Rooms',
        floor: 'Floor',
        area: 'Area',
        price: 'Price'
      },
      status: {
        available: 'Available',
        sold: 'Sold',
        booked: 'Booked'
      },
      book: 'Book Now'
    },
    booking: {
      title: 'Book an Apartment',
      form: {
        name: 'Name',
        phone: 'Phone Number',
        payment: 'Payment Type',
        note: 'Note',
        submit: 'Book Now'
      },
      success: 'Our manager will contact you within 30 minutes'
    }
  }
};

export type Dictionary = typeof dictionaries.uz;
export type Locale = keyof typeof dictionaries;

export const getDictionary = (lang: Locale): Dictionary => dictionaries[lang] || dictionaries.uz;
