import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Schema } from 'mongoose';
import {
  FilmDTO,
  FilmListResponseDTO,
  FilmSheduleDTO,
} from 'src/films/dto/films.dto';
import { TicketDto } from 'src/order/dto/order.dto';

interface ISchedule {
  id: string;
  daytime: Date;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

interface IFilm extends mongoose.Document {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  title: string;
  about: string;
  description: string;
  image: string;
  cover: string;
  schedule: mongoose.Types.DocumentArray<ISchedule>;
}

const scheduleSchema = new Schema({
  id: { type: String, required: true },
  daytime: { type: Date, required: true },
  hall: { type: Number, required: true },
  rows: { type: Number, required: true },
  seats: { type: Number, required: true },
  price: { type: Number, required: true },
  taken: { type: [String], required: true },
});

const FilmSchema = new mongoose.Schema({
  id: { type: String, required: true },
  rating: { type: Number, required: true },
  director: { type: String, required: true },
  tags: { type: [String], required: true },
  title: { type: String, required: true },
  about: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  cover: { type: String, required: true },
  schedule: { type: [scheduleSchema], required: true },
});

const Film = mongoose.model<IFilm>('Film', FilmSchema);

export default Film;

@Injectable()
export class FilmsRepository {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly connection: mongoose.Connection,
    private config: ConfigService,
  ) {
    console.log('Database connection status:', !!this.connection);
  }

  private getFilmMapperFn(): (Film) => FilmDTO {
    return (root) => {
      return {
        id: root.id,
        rating: root.rating,
        director: root.director,
        tags: root.tags,
        title: root.title,
        about: root.about,
        description: root.description,
        image: root.image,
        cover: root.cover,
      };
    };
  }

  async findAll(): Promise<FilmListResponseDTO> {
    const items = await Film.find({});
    const total = await Film.countDocuments({});
    return {
      total,
      items: items.map(this.getFilmMapperFn()),
    };
  }

  async findFilmShedule(id: string): Promise<FilmSheduleDTO> {
    const film = await Film.findOne({ id: id });
    // const film = await Film.findById(id)
    if (!film) {
      throw new Error('Film Not Found');
    }
    const schedules = film.schedule;
    return {
      total: schedules.length,
      items: schedules,
    };
  }
  async reserveSeats(
    filmId: string,
    sessionId: string,
    tickets: TicketDto[],
  ): Promise<IFilm> {
    const film = await Film.findOne({ id: filmId });

    if (!film) {
      throw new Error('Фильм не найден');
    }

    const schedule = film.schedule.find((seat) => seat.id === sessionId);
    if (!schedule) {
      throw new Error('Сеанс не найден');
    }

    const seatsToReserve = tickets.map(
      (ticket) => `${ticket.row}:${ticket.seat}`,
    );

    // Валидация дубликатов
    if (new Set(seatsToReserve).size !== tickets.length) {
      throw new Error('Дубликаты мест в запросе');
    }

    // Проверка уже занятых мест
    const conflicts = seatsToReserve.filter((seat) =>
      schedule.taken.includes(seat),
    );
    if (conflicts.length > 0) {
      throw new Error(`Занятые места: ${conflicts.join(', ')}`);
    }

    // Обновление в базе
    const updated = await Film.findOneAndUpdate(
      {
        id: film.id,
        'schedule.id': schedule.id,
        'schedule.taken': { $nin: seatsToReserve },
      },
      {
        $push: { 'schedule.$.taken': { $each: seatsToReserve } },
        $set: { 'schedule.$.price': tickets[0].price },
      },
      { new: true },
    );

    if (!updated) {
      throw new Error('Ошибка бронирования');
    }

    return updated;
  }
}
