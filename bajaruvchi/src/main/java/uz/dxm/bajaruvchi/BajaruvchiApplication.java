package uz.dxm.bajaruvchi;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.Duration;

@SpringBootApplication
public class BajaruvchiApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(BajaruvchiApplication.class, args);
	}

	@Override
	public void run(String... args) {
		System.out.println(">>> RUN METODIGA KIRDI");

		try {
			WebDriverManager.chromedriver().setup();

			ChromeOptions options = new ChromeOptions();
			// MUHIM: Faqat ochiq turgan portga ulanamiz
			options.setExperimentalOption("debuggerAddress", "127.0.0.1:9222");
			options.addArguments("--remote-allow-origins=*");

			System.out.println(">>> Ochiq turgan Chrome-ga ulanishga urinish...");
			WebDriver driver = new ChromeDriver(options);
			System.out.println(">>> ULANISH MUVAFFAQIYATLI!");

			WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

			// JSHSHIR olish (Siz allaqachon profilga kirib turgan bo'lasiz)
			System.out.println(">>> JSHSHIR olinmoqda...");
			WebElement jshshirElement = wait.until(ExpectedConditions.visibilityOfElementLocated(
					By.xpath("//*[@id=\"root\"]/div/main/div/div[2]/div/div[1]/div[1]/div/div[2]/div/div[4]/div/div/h6")
			));
			String jshshir = jshshirElement.getText().trim();

			// Telefon olish
			System.out.println(">>> Telefon raqami olinmoqda...");
			driver.get("https://id.egov.uz/oz/settings");
			WebElement phoneElement = wait.until(ExpectedConditions.visibilityOfElementLocated(
					By.xpath("//*[@id=\"root\"]/div/main/div/div/div/div[3]/div[1]/table/tbody/tr/td[2]/p")
			));
			String phoneNumber = phoneElement.getText().trim();

			processData(jshshir, phoneNumber);

		} catch (Exception e) {
			System.err.println("!!! Xatolik: Brauzer topilmadi yoki ulanib bo'lmadi.");
			e.printStackTrace();
		}
	}

	// Ma'lumotlarni konsolga chiqarish
	private void processData(String jshshir, String phone) {
		System.out.println("\n==============================");
		System.out.println("JSHSHIR: " + jshshir);
		System.out.println("TELEFON: " + phone);
		System.out.println("==============================\n");

		// Bu yerga keyingi saytga yuborish kodi qo‘shishingiz mumkin
		System.out.println("Ma'lumotlar String ko'rinishida saqlandi. Keyingi bosqichga tayyor.");
	}
}
