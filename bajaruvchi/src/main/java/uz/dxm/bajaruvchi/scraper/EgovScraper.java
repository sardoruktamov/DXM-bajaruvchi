//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.chrome.ChromeDriver;
//import org.openqa.selenium.chrome.ChromeOptions;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.openqa.selenium.support.ui.WebDriverWait;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//
//import java.time.Duration;
//
//@SpringBootApplication
//public class EgovBotApplication implements CommandLineRunner {
//
//    public static void main(String[] args) {
//        SpringApplication.run(EgovBotApplication.class, args);
//    }
//
//    @Override
//    public void run(String... args) {
//        // 1. Ochiq turgan Chrome-ga ulanish (Port: 9222)
//        ChromeOptions options = new ChromeOptions();
//        options.setExperimentalOption("debuggerAddress", "127.0.0.1:9222");
//
//        WebDriver driver = new ChromeDriver(options);
//        // Kutish vaqti (Sahifa yuklanishi uchun)
//        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
//
//        try {
//            System.out.println(">>> Ma'lumotlarni yig'ish boshlandi...");
//
//            // 2. JSHSHIRni olish (Personal sahifasidan)
//            driver.get("https://id.egov.uz/oz/personal");
//
//            // XPath orqali elementni kutib turib topamiz
//            WebElement jshshirElement = wait.until(ExpectedConditions.visibilityOfElementLocated(
//                    By.xpath("//*[@id=\"root\"]/div/main/div/div[2]/div/div[1]/div[1]/div/div[2]/div/div[4]/div/div/h6")
//            ));
//            String jshshir = jshshirElement.getText().trim();
//
//            // 3. Telefon raqamini olish (Settings sahifasidan)
//            driver.get("https://id.egov.uz/oz/settings");
//
//            WebElement phoneElement = wait.until(ExpectedConditions.visibilityOfElementLocated(
//                    By.xpath("//*[@id=\"root\"]/div/main/div/div[2]/div[2]/div[3]/div/div/div[2]/p/span")
//            ));
//            String phoneNumber = phoneElement.getText().trim();
//
//            // 4. Olingan ma'lumotlarni String o'zgaruvchilarda saqlash
//            processData(jshshir, phoneNumber);
//
//        } catch (Exception e) {
//            System.err.println("!!! Xatolik yuz berdi: " + e.getMessage());
//        }
//    }
//
//    // Ma'lumotlarni qayta ishlash uchun alohida metod
//    private void processData(String jshshir, String phone) {
//        System.out.println("\n==============================");
//        System.out.println("JSHSHIR: " + jshshir);
//        System.out.println("TELEFON: " + phone);
//        System.out.println("==============================\n");
//
//        // BU YERDA ENDI KEYINGI SAYTGA (birdarcha.uz) YUBORISH KODINI YOZAMIZ
//        System.out.println("Ma'lumotlar String ko'rinishida saqlandi. Keyingi bosqichga tayyor.");
//    }
//}
////"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\newchrome_deb_prof" --remote-debugging-port=9222
//http://localhost:9222/json