import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Report } from './report.entity';
import { NewReportDto } from './report.dto';

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
}
