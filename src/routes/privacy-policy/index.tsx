import { createFileRoute } from "@tanstack/react-router"
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Divider,
  List,
  Anchor,
  Group,
  Button
} from "@mantine/core"
import { useState } from "react"

export const Route = createFileRoute("/privacy-policy/")({
  component: PrivacyPolicyPage
})

type Language = "vi" | "en"

function PrivacyPolicyPage() {
  const [lang, setLang] = useState<Language>("vi")

  return (
    <Box bg="gray.0" mih="100vh" py={60}>
      <Container size="md">
        <Stack gap="xl">
          <Box>
            <Group justify="space-between" align="flex-start" mb="md">
              <Box style={{ flex: 1 }}>
                <Title order={1} mb="md">
                  {lang === "vi"
                    ? "Chính Sách Bảo Mật và Điều Khoản Sử Dụng"
                    : "Privacy Policy and Terms of Service"}
                </Title>
                <Text c="dimmed" size="sm">
                  {lang === "vi"
                    ? `Cập nhật lần cuối: ${new Date().toLocaleDateString("vi-VN")}`
                    : `Last updated: ${new Date().toLocaleDateString("en-US")}`}
                </Text>
              </Box>
              <Group gap="xs">
                <Button
                  variant={lang === "vi" ? "filled" : "light"}
                  size="sm"
                  onClick={() => setLang("vi")}
                >
                  Tiếng Việt
                </Button>
                <Button
                  variant={lang === "en" ? "filled" : "light"}
                  size="sm"
                  onClick={() => setLang("en")}
                >
                  English
                </Button>
              </Group>
            </Group>
          </Box>

          <Divider />

          {/* Privacy Policy */}
          <Box>
            <Title order={2} mb="md">
              {lang === "vi" ? "Chính Sách Bảo Mật" : "Privacy Policy"}
            </Title>

            <Stack gap="lg">
              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "1. Thông Tin Chúng Tôi Thu Thập"
                    : "1. Information We Collect"}
                </Title>
                <Text mb="sm">
                  {lang === "vi"
                    ? "Chúng tôi thu thập các thông tin sau để cung cấp dịch vụ tốt nhất cho bạn:"
                    : "We collect the following information to provide you with the best service:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Thông tin cá nhân:"
                        : "Personal information:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Họ tên, số điện thoại, địa chỉ email, địa chỉ giao hàng"
                      : "Full name, phone number, email address, delivery address"}
                  </List.Item>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Thông tin từ Facebook:"
                        : "Facebook information:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "ID Facebook (PSID), tên hiển thị, ảnh đại diện (khi bạn tương tác với chúng tôi qua Facebook Messenger)"
                      : "Facebook ID (PSID), display name, profile picture (when you interact with us via Facebook Messenger)"}
                  </List.Item>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Thông tin đơn hàng:"
                        : "Order information:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Sản phẩm đặt mua, giá trị đơn hàng, lịch sử mua hàng"
                      : "Purchased products, order value, purchase history"}
                  </List.Item>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Dữ liệu tương tác:"
                        : "Interaction data:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Tin nhắn, phản hồi, yêu cầu hỗ trợ"
                      : "Messages, feedback, support requests"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "2. Mục Đích Sử Dụng Thông Tin"
                    : "2. Purpose of Information Use"}
                </Title>
                <Text mb="sm">
                  {lang === "vi"
                    ? "Chúng tôi sử dụng thông tin của bạn để:"
                    : "We use your information to:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Xử lý và giao đơn hàng của bạn một cách chính xác"
                      : "Process and deliver your orders accurately"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Liên hệ và hỗ trợ khách hàng qua Facebook Messenger và các kênh khác"
                      : "Contact and support customers via Facebook Messenger and other channels"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Gửi thông báo về trạng thái đơn hàng, chương trình khuyến mãi"
                      : "Send notifications about order status and promotions"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Cải thiện chất lượng dịch vụ và trải nghiệm khách hàng"
                      : "Improve service quality and customer experience"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Phân tích dữ liệu để tối ưu hóa hoạt động kinh doanh"
                      : "Analyze data to optimize business operations"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "3. Bảo Vệ Thông Tin"
                    : "3. Information Protection"}
                </Title>
                <Text mb="sm">
                  {lang === "vi"
                    ? "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn:"
                    : "We are committed to protecting your personal information:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Sử dụng các biện pháp bảo mật kỹ thuật hiện đại (mã hóa SSL/TLS, xác thực đa yếu tố)"
                      : "Use modern technical security measures (SSL/TLS encryption, multi-factor authentication)"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Chỉ nhân viên được ủy quyền mới có quyền truy cập dữ liệu"
                      : "Only authorized employees have data access"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Tuân thủ các tiêu chuẩn bảo mật quốc tế và quy định của Facebook Platform"
                      : "Comply with international security standards and Facebook Platform policies"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Không bán hoặc chia sẻ thông tin của bạn cho bên thứ ba vì mục đích thương mại"
                      : "Do not sell or share your information with third parties for commercial purposes"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "4. Chia Sẻ Thông Tin"
                    : "4. Information Sharing"}
                </Title>
                <Text mb="sm">
                  {lang === "vi"
                    ? "Chúng tôi chỉ chia sẻ thông tin của bạn trong các trường hợp sau:"
                    : "We only share your information in the following cases:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Đối tác vận chuyển:"
                        : "Shipping partners:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Để giao hàng đến bạn"
                      : "To deliver to you"}
                  </List.Item>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Đối tác thanh toán:"
                        : "Payment partners:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Để xử lý giao dịch thanh toán"
                      : "To process payment transactions"}
                  </List.Item>
                  <List.Item>
                    <strong>
                      {lang === "vi"
                        ? "Yêu cầu pháp lý:"
                        : "Legal requirements:"}
                    </strong>{" "}
                    {lang === "vi"
                      ? "Khi có yêu cầu từ cơ quan chức năng"
                      : "When required by authorities"}
                  </List.Item>
                  <List.Item>
                    <strong>Facebook Platform:</strong>{" "}
                    {lang === "vi"
                      ? "Thông tin cần thiết để sử dụng Facebook Messenger API"
                      : "Information necessary to use Facebook Messenger API"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi" ? "5. Quyền Của Bạn" : "5. Your Rights"}
                </Title>
                <Text mb="sm">
                  {lang === "vi"
                    ? "Bạn có các quyền sau đối với dữ liệu cá nhân:"
                    : "You have the following rights regarding your personal data:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    <strong>{lang === "vi" ? "Truy cập:" : "Access:"}</strong>{" "}
                    {lang === "vi"
                      ? "Yêu cầu xem thông tin cá nhân chúng tôi đang lưu trữ"
                      : "Request to view personal information we are storing"}
                  </List.Item>
                  <List.Item>
                    <strong>{lang === "vi" ? "Chỉnh sửa:" : "Edit:"}</strong>{" "}
                    {lang === "vi"
                      ? "Cập nhật hoặc sửa đổi thông tin không chính xác"
                      : "Update or modify inaccurate information"}
                  </List.Item>
                  <List.Item>
                    <strong>{lang === "vi" ? "Xóa:" : "Delete:"}</strong>{" "}
                    {lang === "vi"
                      ? "Yêu cầu xóa dữ liệu cá nhân (trừ thông tin bắt buộc lưu trữ theo quy định pháp luật)"
                      : "Request deletion of personal data (except information required by law)"}
                  </List.Item>
                  <List.Item>
                    <strong>{lang === "vi" ? "Từ chối:" : "Opt-out:"}</strong>{" "}
                    {lang === "vi"
                      ? "Từ chối nhận thông tin marketing (không ảnh hưởng đến thông báo đơn hàng)"
                      : "Refuse marketing information (does not affect order notifications)"}
                  </List.Item>
                </List>
                <Text mt="sm">
                  {lang === "vi"
                    ? "Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua thông tin bên dưới."
                    : "To exercise these rights, please contact us via the information below."}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "6. Cookies và Công Nghệ Theo Dõi"
                    : "6. Cookies and Tracking Technologies"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Website của chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng, phân tích lưu lượng truy cập và cá nhân hóa nội dung. Bạn có thể quản lý cài đặt cookies trong trình duyệt của mình."
                    : "Our website uses cookies to improve user experience, analyze traffic, and personalize content. You can manage cookie settings in your browser."}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi" ? "7. Lưu Trữ Dữ Liệu" : "7. Data Retention"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian cần thiết để cung cấp dịch vụ và tuân thủ nghĩa vụ pháp lý. Dữ liệu không còn cần thiết sẽ được xóa hoặc ẩn danh hóa một cách an toàn."
                    : "We retain your personal information for as long as necessary to provide services and comply with legal obligations. Unnecessary data will be safely deleted or anonymized."}
                </Text>
              </Box>
            </Stack>
          </Box>

          <Divider my="xl" />

          {/* Terms of Service */}
          <Box>
            <Title order={2} mb="md">
              {lang === "vi" ? "Điều Khoản Sử Dụng" : "Terms of Service"}
            </Title>

            <Stack gap="lg">
              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "1. Chấp Nhận Điều Khoản"
                    : "1. Acceptance of Terms"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ."
                    : "By accessing and using our services, you agree to comply with the terms and conditions set forth in this document. If you do not agree, please do not use the service."}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "2. Tài Khoản và Bảo Mật"
                    : "2. Account and Security"}
                </Title>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình"
                      : "You are responsible for securing your account information"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép"
                      : "Notify us immediately if you detect unauthorized access"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Không được chia sẻ tài khoản cho người khác"
                      : "Do not share your account with others"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Chúng tôi có quyền tạm ngưng hoặc hủy tài khoản vi phạm điều khoản"
                      : "We reserve the right to suspend or cancel accounts that violate terms"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "3. Đặt Hàng và Thanh Toán"
                    : "3. Ordering and Payment"}
                </Title>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Giá cả và sản phẩm có thể thay đổi mà không cần thông báo trước"
                      : "Prices and products may change without prior notice"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Đơn hàng chỉ được xác nhận sau khi thanh toán thành công"
                      : "Orders are only confirmed after successful payment"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp (lỗi giá, hết hàng, gian lận...)"
                      : "We reserve the right to refuse or cancel orders in certain cases (pricing errors, out of stock, fraud...)"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Khách hàng chịu trách nhiệm cung cấp thông tin chính xác"
                      : "Customers are responsible for providing accurate information"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "4. Giao Hàng và Hoàn Trả"
                    : "4. Delivery and Returns"}
                </Title>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Thời gian giao hàng là ước tính và có thể thay đổi"
                      : "Delivery times are estimates and may vary"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Chúng tôi không chịu trách nhiệm cho các chậm trễ do bên vận chuyển"
                      : "We are not responsible for delays caused by shipping partners"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Chính sách đổi trả tuân theo quy định hiện hành của công ty"
                      : "Return policy follows current company regulations"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Sản phẩm lỗi do nhà sản xuất sẽ được đổi trả theo quy định"
                      : "Manufacturer defects will be exchanged or refunded according to regulations"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "5. Hành Vi Bị Cấm"
                    : "5. Prohibited Conduct"}
                </Title>
                <Text mb="sm">
                  {lang === "vi" ? "Bạn không được:" : "You must not:"}
                </Text>
                <List withPadding>
                  <List.Item>
                    {lang === "vi"
                      ? "Sử dụng dịch vụ cho mục đích bất hợp pháp"
                      : "Use the service for illegal purposes"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Cố gắng truy cập trái phép vào hệ thống"
                      : "Attempt unauthorized access to the system"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Gửi spam, virus, hoặc mã độc hại"
                      : "Send spam, viruses, or malicious code"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Làm gián đoạn hoặc phá hoại dịch vụ"
                      : "Disrupt or damage the service"}
                  </List.Item>
                  <List.Item>
                    {lang === "vi"
                      ? "Vi phạm quyền sở hữu trí tuệ của chúng tôi hoặc bên thứ ba"
                      : "Violate intellectual property rights of us or third parties"}
                  </List.Item>
                </List>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "6. Quyền Sở Hữu Trí Tuệ"
                    : "6. Intellectual Property Rights"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Tất cả nội dung trên website (văn bản, hình ảnh, logo, thiết kế...) thuộc quyền sở hữu của chúng tôi hoặc đối tác được cấp phép. Nghiêm cấm sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép."
                    : "All content on the website (text, images, logos, designs...) is owned by us or licensed partners. Copying, distributing, or using for commercial purposes without permission is strictly prohibited."}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "7. Giới Hạn Trách Nhiệm"
                    : "7. Limitation of Liability"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? 'Chúng tôi cung cấp dịch vụ "nguyên trạng" và không đảm bảo rằng dịch vụ sẽ luôn không bị gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp, ngẫu nhiên, hoặc do hậu quả phát sinh từ việc sử dụng dịch vụ.'
                    : 'We provide the service "as is" and do not guarantee that it will always be uninterrupted or error-free. We are not liable for indirect, incidental, or consequential damages arising from the use of the service.'}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi"
                    ? "8. Thay Đổi Điều Khoản"
                    : "8. Changes to Terms"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Chúng tôi có quyền cập nhật hoặc sửa đổi các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng trên website. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới."
                    : "We reserve the right to update or modify these terms at any time. Changes will take effect immediately upon posting on the website. Your continued use of the service after changes constitutes acceptance of the new terms."}
                </Text>
              </Box>

              <Box>
                <Title order={3} size="h4" mb="sm">
                  {lang === "vi" ? "9. Luật Áp Dụng" : "9. Governing Law"}
                </Title>
                <Text>
                  {lang === "vi"
                    ? "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam."
                    : "These terms are governed by the laws of Vietnam. Any disputes arising will be resolved in competent courts in Vietnam."}
                </Text>
              </Box>
            </Stack>
          </Box>

          <Divider my="xl" />

          {/* Contact */}
          <Box>
            <Title order={2} mb="md">
              {lang === "vi" ? "Liên Hệ" : "Contact"}
            </Title>
            <Text mb="sm">
              {lang === "vi"
                ? "Nếu bạn có bất kỳ câu hỏi nào về Chính Sách Bảo Mật hoặc Điều Khoản Sử Dụng, vui lòng liên hệ với chúng tôi qua:"
                : "If you have any questions about our Privacy Policy or Terms of Service, please contact us via:"}
            </Text>
            <List withPadding>
              <List.Item>
                <strong>Email:</strong>{" "}
                <Anchor href="mailto:support@candy-cal.com">
                  support@candy-cal.com
                </Anchor>
              </List.Item>
              <List.Item>
                <strong>{lang === "vi" ? "Điện thoại:" : "Phone:"}</strong> 1900
                xxxx
              </List.Item>
              <List.Item>
                <strong>{lang === "vi" ? "Địa chỉ:" : "Address:"}</strong>{" "}
                {lang === "vi"
                  ? "[Địa chỉ công ty của bạn]"
                  : "[Your company address]"}
              </List.Item>
            </List>
          </Box>

          <Box bg="blue.0" p="md" style={{ borderRadius: 8 }}>
            <Text size="sm" c="dimmed" ta="center">
              © {new Date().getFullYear()} Candy Cal.{" "}
              {lang === "vi" ? "Bảo lưu mọi quyền." : "All rights reserved."}
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
