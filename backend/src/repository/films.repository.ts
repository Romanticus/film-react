import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import mongoose, { Schema, Mongoose } from 'mongoose';
import { async } from 'rxjs';
import { AppConfig } from 'src/app.config.provider';
import { FilmDTO, FilmListResponseDTO } from 'src/films/dto/films.dto';

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
  id: { type: String, required: true }, // Идентификатор фильма (UUID)
  rating: { type: Number, required: true }, // Рейтинг фильма
  director: { type: String, required: true }, // Режиссер
  tags: { type: [String], required: true }, // Теги фильма
  title: { type: String, required: true }, // Название фильма
  about: { type: String, required: true }, // Краткое описание
  description: { type: String, required: true }, // Полное описание
  image: { type: String, required: true }, // URL изображения
  cover: { type: String, required: true }, // URL обложки
  schedule: { type: [scheduleSchema], required: true },
});

const Film = mongoose.model('Film', FilmSchema);

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
        id: root._id,
        rating: root.rating, // Рейтинг фильма
        director: root.director, // Режиссер
        tags: root.tags, // Теги фильма
        title: root.title, // Название фильма
        about: root.about, // Краткое описание
        description: root.description, // Полное описание
        image: root.image, // URL изображения
        cover: root.cover, // URL обложки
      };
    };
  }

  async findAll(): Promise<FilmListResponseDTO> {
    let items = await Film.find({}); //используем обычные методы Mongoose-документов
    let total = await Film.countDocuments({});
    return {
      total,
      items: items.map(this.getFilmMapperFn()),
    };
  }
}
