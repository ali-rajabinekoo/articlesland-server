import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Report } from './report.entity';
import { NewReportDto } from './report.dto';
import { getReportsLimit } from '../libs/config';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async newReport(report: NewReportDto): Promise<void> {
    const reportInstance: Report = await this.reportRepository.create(report);
    await this.reportRepository.save(reportInstance);
  }

  async check(body: NewReportDto): Promise<boolean> {
    const query: FindOptionsWhere<Report> = {
      owner: { id: body.owner.id },
      type: body.type,
    };
    if (!!body.comment) {
      query.comment = { id: body.comment.id };
    }
    if (!!body.article) {
      query.article = { id: body.article.id };
    }
    const report: Report = await this.reportRepository.findOneBy(query);
    return Boolean(report);
  }

  async getAllReport(
    keyword?: string | undefined,
    page?: number,
    reportType?: string | undefined,
    reportContentType?: string | undefined,
    moreWhere?: FindOptionsWhere<Report>,
  ): Promise<[Report[], number]> {
    const wheres: FindOptionsWhere<Report>[] = [];
    const baseWhere: FindOptionsWhere<Report> = {};
    if (!!reportType) baseWhere.type = reportType;
    if (!!reportContentType) {
      switch (reportContentType) {
        case 'post':
          baseWhere.article = { id: null };
          break;
        case 'comment':
          baseWhere.comment = { id: null };
          break;
      }
    }
    const findQuery: FindManyOptions = {
      relations: [
        'owner',
        'article',
        'comment',
        'comment.owner',
        'comment.article',
        'article.owner',
      ],
      skip: getReportsLimit * (page || 1) - getReportsLimit || 0,
      take: getReportsLimit,
      order: { created_at: 'desc' },
    };
    if (!!keyword?.trim()) {
      wheres[0] = { owner: { username: ILike(`%${keyword}%`) }, ...baseWhere };
      wheres[1] = {
        owner: { displayName: ILike(`%${keyword}%`) },
        ...baseWhere,
      };
      wheres[2] = { content: ILike(`%${keyword}%`), ...baseWhere };
      // wheres[3] = {
      //   comment: { body: ILike(`%${keyword}%`), ...baseWhere },
      // };
      // wheres[4] = {
      //   comment: { owner: { username: ILike(`%${keyword}%`) } },
      //   article: null,
      // };
      // wheres[5] = {
      //   comment: { owner: { displayName: ILike(`%${keyword}%`) } },
      //   article: null,
      // };
      // wheres[6] = {
      //   article: { owner: { username: ILike(`%${keyword}%`) } },
      //   comment: null,
      // };
      // wheres[7] = {
      //   article: { owner: { displayName: ILike(`%${keyword}%`) } },
      //   comment: null,
      // };
    }
    if (!!moreWhere) {
      for (let i = 0; i < wheres.length; i++) {
        wheres[i] = !!wheres[i] ? { ...wheres[i], ...moreWhere } : moreWhere;
      }
    }
    if (wheres.length !== 0) {
      findQuery.where = wheres;
    } else if (Object.keys(baseWhere).length !== 0) {
      findQuery.where = baseWhere;
    }
    return this.reportRepository.findAndCount(findQuery);
  }

  async findAndRemove(reportId: number): Promise<void> {
    const report: Report = await this.reportRepository.findOneBy({
      id: reportId,
    });
    if (!!report) await this.reportRepository.remove(report);
  }
}
