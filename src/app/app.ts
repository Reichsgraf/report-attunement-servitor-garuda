import {Component, Inject, LOCALE_ID, OnInit, Signal, signal, computed} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import { Clipboard } from '@angular/cdk/clipboard';
import {formatDate} from '@angular/common';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatButton,
    MatTimepickerModule,
    MatAutocompleteModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'uk-UA' }
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App implements OnInit {
  protected formGroup: FormGroup;
  protected uavOptions = [
    'ГЕНЕРАЛ ЧЕРЕШНЯ МОД 1',
    'ГЕНЕРАЛ ЧЕРЕШНЯ МОД 2',
    'SPOOK 10',
    'BLINK 10',
    'ORTUS TFT-K 10',
    'ORTUS TF-K 10',
    'STING ПЕРЕХОПЛЮВАЧ',
    'ПЕГАС 10',
    'ПЕГАС 10 ТК'
  ].sort()
  protected resultOptions = ['придушення', 'виведення з ладу', 'знищення', 'втрата']
  protected warheadOptions = [
    'ЗБ-500',
    'ЗБ Корсар',
    'ГРУТ-С',
    'HFB0500C',
    'HFB0600F',
    'БНПП-40',
    'БНПП-40М',
    'КО-1.3 Пузатий змій',
    'МАБ-Л1.5 Ое',
    'МБ-50КУЗ МАЛЮК',
    'МОА-Композит 61',
    'МОН-100.1',
    'ОГ-Б1 2,8кг',
    'ПВВ-7-1',
    'ПВР Кемікс 200г',
    'ПВР Семтекс 10 500г',
    'ПГ-7Л',
    'СВП Запальничка',
    'СВП для ППО ДВІЖУХА',
    'СВП напалм 1,5кг',
    'СВП напалм 1кг',
    'СВП уламково-фугасний 1кг',
    'СВП уламок 0,2кг',
    'СВП фугасний 1кг',
    'СВП фугасно-запалювальний 1,6кг',
    'Терміт 0,9кг',
    'УАБК-1.5-А',
    'УЯ-У-65-0.5',
    'УЯ-У-65-1.3',
    'уламковий кругового ураження 1,2кг',
    'фугасний Bullet 0.5кг',
    'фугасний Sting 0.5кг',
    'фугасний кемікс 0.5кг',
  ].sort()
  protected detonatorOptions = ['', 'ЕД-8-ж', 'ЕДП-р']

  filteredUavOptions!: Signal<string[]>;
  filteredWarheadOptions!: Signal<string[]>;

  constructor(
    private clipboard: Clipboard,
    @Inject(LOCALE_ID) private locale: string
  ) {
    const currentDate: Date = new Date();

    this.formGroup = new FormGroup({
      unitName: new FormControl(''),
      crewName: new FormControl(''),
      date: new FormControl(currentDate),
      target: new FormControl(''),
      coordinates: new FormControl(''),
      location: new FormControl(''),
      distance: new FormControl(''),
      result: new FormControl(''),

      uav: new FormControl(''),
      warhead: new FormControl(''),
      detonator: new FormControl(''),

      comment: new FormControl(''),
    });

    const uavValue = toSignal(
      this.formGroup.get('uav')!.valueChanges,
      { initialValue: '' }
    );

    this.filteredUavOptions = computed(() => {
      const value = (uavValue() ?? '').toLowerCase();
      return this.uavOptions.filter(option =>
        option.toLowerCase().includes(value)
      );
    });

    const warheadValue = toSignal(
      this.formGroup.get('warhead')!.valueChanges,
      { initialValue: '' }
    );

    this.filteredWarheadOptions = computed(() => {
      const value = (warheadValue() ?? '').toLowerCase();
      return this.warheadOptions.filter(option =>
        option.toLowerCase().includes(value)
      );
    });
  }

  ngOnInit() {

  }

  setCurrentTime(controlName: string) {
    const currentDate: Date = new Date();
    this.formGroup.get(controlName)?.setValue(currentDate);
  }

  endFlight() {
    const date = this.formatMissionDate("date")
    const time = this.formatMissionTime("date")
    let report_message =
      `Підрозділ: ${this.formGroup.get("unitName")?.value}\n` +
      `Екіпаж: ${this.formGroup.get("crewName")?.value}\n` +
      `Дата: ${date}\n` +
      `Час застосування: ${time}\n` +
      `Тип цілі: ${this.formGroup.get("target")?.value}\n` +
      `Координати: ${this.formGroup.get("coordinates")?.value}\n` +
      `р.н.п. ${this.formGroup.get("location")?.value}\n`
    if (this.formGroup.get("distance")?.value) {
      report_message += `Відстань: ${this.formGroup.get("distance")?.value.replace("км", "").trim()} км\n`
    }
    report_message +=
      `Результат: ${this.formGroup.get("result")?.value}\n` +
      `Засіб ураження: ${this.formGroup.get("uav")?.value}\n`
    if (this.formGroup.get("warhead")?.value) {
      report_message += `Бойова частина: ${this.formGroup.get("warhead")?.value}\n`
    }
    if (this.formGroup.get("detonator")?.value) {
      report_message += `Детонатор: ${this.formGroup.get("detonator")?.value}\n`
    }
    if (this.formGroup.get("comment")?.value) {
      report_message += `\n${this.formGroup.get("comment")?.value}\n`
    }

    this.clipboard.copy(report_message);
  }

  formatMissionDate(dateControlName: string) {
    const dateTime = new Date(this.formGroup.get(dateControlName)?.value)
    return formatDate(dateTime, "dd.MM.yyyy", this.locale)
  }

  formatMissionTime(dateControlName: string) {
    const dateTime = new Date(this.formGroup.get(dateControlName)?.value)
    return formatDate(dateTime, "HH:mm", this.locale)
  }
}
